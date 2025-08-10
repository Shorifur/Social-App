// server/api/graphql/schema.js
type Post {
  id: ID!
  content: String!
  comments: [Comment] @relationship
}