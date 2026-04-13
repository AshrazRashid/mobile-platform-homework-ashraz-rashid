import { NativeModules } from 'react-native';

type NativeLoggerType = {
  writeLog: (content: string) => void;
  writeAuditExport: (jsonPayload: string) => void;
};

const NativeLogger: NativeLoggerType | undefined =
  NativeModules.NativeLogger as NativeLoggerType | undefined;

export function writeNativeLog(message: string): void {
  NativeLogger?.writeLog(message);
}

export function writeNativeAuditExport(jsonPayload: string): void {
  NativeLogger?.writeAuditExport(jsonPayload);
}

export function isNativeLoggerAvailable(): boolean {
  return NativeLogger != null;
}
