import { ReactiveQueue } from 'meteor/jkuester:reactive-queue'
import { Random } from 'meteor/random'
import { check, Match } from 'meteor/check'

export const Notify = {}

const queue = new ReactiveQueue()

const defaults = {
  type: 'primary',
  dismiss: true,
  autohide: true,
  delay: 3000,
  animation: true,
  icon: 'information',
}

Notify.add = (notification) => {
  check(notification, Match.ObjectIncluding({
    type: String,
    title: Match.Maybe(Match.OneOf(String, Function)),
    subtitle: Match.Maybe(String),
    icon: Match.Maybe(String),
    message: Match.Maybe(Match.OneOf(String, Function)),
    dismiss: Match.Maybe(Boolean),
    autohide: Match.Maybe(Boolean),
    delay: Match.Maybe(Number),
    animation: Match.Maybe(Boolean)
  }))

  const id = Random.id(6)
  queue.enqueue({
    id,
    ...defaults,
    ...notification
  })
}

Notify.get = () => {
  return queue.dequeue()
}

Notify.isEmpty = () => queue.isEmpty()

Notify.remove = id => queue.delete(id)
