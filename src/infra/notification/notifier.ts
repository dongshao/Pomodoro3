import type { Phase } from '../../types/pomodoro'

export type NotificationPermissionStatus = NotificationPermission | 'unsupported'

const phaseTextMap: Record<Phase, string> = {
  focus: '专注阶段完成，休息一下。',
  shortBreak: '短休结束，准备开始下一轮专注。',
  longBreak: '长休结束，开始新的专注周期。',
}

export const getNotificationPermission = (): NotificationPermissionStatus => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }

  return Notification.permission
}

export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }

  const permission = await Notification.requestPermission()
  return permission
}

export const notifyPhaseCompleted = (phase: Phase): void => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  if (Notification.permission !== 'granted') {
    return
  }

  const title = phase === 'focus' ? '番茄完成' : '休息结束'
  new Notification(title, { body: phaseTextMap[phase] })
}
