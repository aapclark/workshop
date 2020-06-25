import { schema } from 'nexus'
import { arg } from 'nexus/components/schema'

schema.objectType({
    name: 'Post',
    definition(t) {
        t.int('id')
        t.string('title')
        t.string('body')
        t.boolean('published')
    }
})

schema.extendType({
    type: 'Query',
    definition(t) {
        t.field('drafts', {
            nullable: false,
            type: 'Post',
            list: true,
            resolve(_root, _args, ctx) {
                return ctx.db.posts.filter(p => p.published === false)
            }
        })
        t.field('posts', {
            nullable: false,
            type: 'Post',
            list: true,
            resolve(_root, _args, ctx) {
                return ctx.db.posts.filter(p => p.published === true)
            }
        })
    }
})


schema.extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createDraft', {
            type: 'Post',
            nullable: false,
            args: {
                title: schema.stringArg({ required: true }),
                body: schema.stringArg({ required: true }),
            },
            resolve(_root, args, ctx) {
                const draft = {
                    id: ctx.db.posts.length + 1,
                    title: args.title,
                    body: args.body,
                    published: false,
                }
                ctx.db.posts.push(draft)
                return draft
            }
        })
        t.field('publish', {
            type: 'Post',
            nullable: false,
            args: {
                draftId: schema.intArg({ required: true })
            },
            resolve(_root, args, ctx) {
                let draftToPublish = ctx.db.posts.find(p => p.id === args.draftId)
                if (!draftToPublish) {
                    throw new Error('No draft found.')
                }
                draftToPublish.published = true
                return draftToPublish
            }
        })
    }
})
