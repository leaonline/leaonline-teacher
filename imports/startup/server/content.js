import { ContentServer } from '../../api/remotes/ContentServer'
import { ContentDefinitions } from '../../contexts/content/ContentDefinitions'
import { contentBuilder } from '../../api/build/contentBuilder'

ContentDefinitions.all().forEach(ctx => contentBuilder(ctx))

ContentServer.connect()
