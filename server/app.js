/* eslint-disable no-console */
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://main:PasswordMain@cluster0.ldgrq.mongodb.net/ql-project?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
  console.log('Connected to DB');
})
const schema = require('./schema/schema');

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(4000, () => {
  console.log('Listening to port 4000');
});
