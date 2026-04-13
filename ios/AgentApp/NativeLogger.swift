import Foundation

@objc(NativeLogger)
class NativeLogger: NSObject {

  @objc(writeLog:)
  func writeLog(_ content: String) {
    guard let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
      return
    }
    let url = docs.appendingPathComponent("app_agent_audit.log")
    let line = "\(Int(Date().timeIntervalSince1970 * 1000)): \(content)\n"
    let prior = (try? String(contentsOf: url, encoding: .utf8)) ?? ""
    try? (prior + line).write(to: url, atomically: true, encoding: .utf8)
  }

  @objc(writeAuditExport:)
  func writeAuditExport(_ jsonPayload: String) {
    guard let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
      return
    }
    let url = docs.appendingPathComponent("audit_export.json")
    try? jsonPayload.write(to: url, atomically: true, encoding: .utf8)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }
}
