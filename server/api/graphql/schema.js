const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Post {
    id: ID!
    content: String!
    comments: [Comment]
  }

  type Comment {
    id: ID!
    text: String!
    postId: ID!
  }
`;

module.exports = typeDefs;
