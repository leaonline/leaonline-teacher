const { RUN_FLAG } = process.env

if (Meteor.isDevelopment && !RUN_FLAG) {
  console.error('-------------------------------------------------------------------------------------------------')
  console.error()
  console.error('[FATAL]: startup cancelled. Please run the app using the [run.sh] script from the project folder.')
  console.error()
  console.error('-------------------------------------------------------------------------------------------------')
  throw new Error()
}
