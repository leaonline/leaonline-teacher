import { onServer } from '../../utils/arch'

export const createMyPublication = ({ context }) => {
  return {
    name: `${context.name}.publications.my`,
    schema: {},
    run: onServer(function () {
      return context.collection().find({
        $or: [
          { 'meta.createdBy': this.userId },
          { 'meta.sharedWith': this.userId },
        ]
      })
    })
  }
}
