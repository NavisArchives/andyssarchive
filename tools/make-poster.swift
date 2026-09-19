import Foundation
import AVFoundation
import AppKit

let args = CommandLine.arguments
guard args.count >= 4 else { print("usage: poster <in> <out.jpg> <seconds> [maxWidth]"); exit(1) }
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])
let secs = Double(args[3]) ?? 1.0
let maxW = args.count > 4 ? Double(args[4])! : 720.0

let asset = AVURLAsset(url: inURL)
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = CMTime(seconds: 0.5, preferredTimescale: 600)
gen.requestedTimeToleranceAfter  = CMTime(seconds: 0.5, preferredTimescale: 600)
gen.maximumSize = CGSize(width: maxW, height: maxW * 4)

do {
  let cg = try gen.copyCGImage(at: CMTime(seconds: secs, preferredTimescale: 600), actualTime: nil)
  let rep = NSBitmapImageRep(cgImage: cg)
  guard let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.82]) else { exit(2) }
  try data.write(to: outURL)
  print("ok \(cg.width)x\(cg.height) -> \(outURL.lastPathComponent)")
} catch {
  print("ERR \(inURL.lastPathComponent): \(error)")
  exit(3)
}
