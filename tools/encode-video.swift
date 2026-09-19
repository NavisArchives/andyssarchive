import Foundation
import AVFoundation
import CoreMedia

// usage: webexport2 <outDir> <targetShortSide> <videoBitrate> <in...>
let a = CommandLine.arguments
let outDir = URL(fileURLWithPath: a[1], isDirectory: true)
let targetShort = Int(a[2])!
let vBitrate = Int(a[3])!
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
let inputs = a.dropFirst(4).map { URL(fileURLWithPath: $0) }

func even(_ v: Int) -> Int { v % 2 == 0 ? v : v + 1 }

let sem = DispatchSemaphore(value: 0)
Task {
  for u in inputs {
    let base = u.deletingPathExtension().lastPathComponent
    let out = outDir.appendingPathComponent(base + ".mp4")
    if FileManager.default.fileExists(atPath: out.path) { print("skip \(base)"); continue }
    do {
      let asset = AVURLAsset(url: u)
      guard let vTrack = try await asset.loadTracks(withMediaType: .video).first else { print("ERR novideo \(base)"); continue }
      let natural = try await vTrack.load(.naturalSize)
      let tf = try await vTrack.load(.preferredTransform)
      let dispW = abs(natural.width * tf.a + natural.height * tf.c)
      let dispH = abs(natural.width * tf.b + natural.height * tf.d)
      let scale = Double(targetShort) / Double(min(dispW, dispH))
      let preW = even(Int((Double(natural.width) * scale).rounded()))
      let preH = even(Int((Double(natural.height) * scale).rounded()))
      let nominalFPS = try await vTrack.load(.nominalFrameRate)
      let fps = nominalFPS > 1 ? min(nominalFPS, 30) : 30

      let reader = try AVAssetReader(asset: asset)
      let vOut = AVAssetReaderTrackOutput(track: vTrack, outputSettings: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: preW,
        kCVPixelBufferHeightKey as String: preH])
      vOut.alwaysCopiesSampleData = false
      reader.add(vOut)

      var aOut: AVAssetReaderTrackOutput? = nil
      if let aTrack = try await asset.loadTracks(withMediaType: .audio).first {
        let o = AVAssetReaderTrackOutput(track: aTrack, outputSettings: [
          AVFormatIDKey: kAudioFormatLinearPCM,
          AVLinearPCMBitDepthKey: 16, AVLinearPCMIsFloatKey: false,
          AVLinearPCMIsBigEndianKey: false, AVLinearPCMIsNonInterleaved: false])
        o.alwaysCopiesSampleData = false
        reader.add(o); aOut = o
      }

      try? FileManager.default.removeItem(at: out)
      let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
      writer.shouldOptimizeForNetworkUse = true
      let vIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: preW, AVVideoHeightKey: preH,
        AVVideoCompressionPropertiesKey: [
          AVVideoAverageBitRateKey: vBitrate,
          AVVideoMaxKeyFrameIntervalKey: Int(fps * 2),
          AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
          AVVideoAllowFrameReorderingKey: true,
          AVVideoExpectedSourceFrameRateKey: Int(fps)
        ]])
      vIn.expectsMediaDataInRealTime = false
      vIn.transform = tf
      writer.add(vIn)

      var aIn: AVAssetWriterInput? = nil
      if aOut != nil {
        let i = AVAssetWriterInput(mediaType: .audio, outputSettings: [
          AVFormatIDKey: kAudioFormatMPEG4AAC, AVNumberOfChannelsKey: 2,
          AVSampleRateKey: 44100, AVEncoderBitRateKey: 96000])
        i.expectsMediaDataInRealTime = false
        writer.add(i); aIn = i
      }

      guard writer.startWriting() else { print("ERR start \(base): \(String(describing: writer.error))"); continue }
      reader.startReading()
      writer.startSession(atSourceTime: .zero)
      let vDone = DispatchSemaphore(value: 0), aDone = DispatchSemaphore(value: 0)

      vIn.requestMediaDataWhenReady(on: DispatchQueue(label: "vid")) {
        while vIn.isReadyForMoreMediaData {
          guard let sb = vOut.copyNextSampleBuffer() else { vIn.markAsFinished(); vDone.signal(); return }
          vIn.append(sb)
        }
      }
      if let aIn = aIn, let aOut = aOut {
        aIn.requestMediaDataWhenReady(on: DispatchQueue(label: "aud")) {
          while aIn.isReadyForMoreMediaData {
            guard let sb = aOut.copyNextSampleBuffer() else { aIn.markAsFinished(); aDone.signal(); return }
            aIn.append(sb)
          }
        }
      } else { aDone.signal() }

      vDone.wait(); aDone.wait()
      await writer.finishWriting()
      if writer.status == .completed {
        let sz = ((try? FileManager.default.attributesOfItem(atPath: out.path)[.size]) as? Int) ?? 0
        print("ok \(base).mp4 \(preW)x\(preH) \(sz/1_000_000)MB")
      } else {
        print("ERR \(base): \(String(describing: writer.error))"); try? FileManager.default.removeItem(at: out)
      }
    } catch { print("ERR \(base): \(error)") }
  }
  print("DONE")
  sem.signal()
}
sem.wait()
