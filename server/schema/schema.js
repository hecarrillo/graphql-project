/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
const graphql = require('graphql');
const _ = require('lodash');
const User = require('../model/user');
const Post = require('../model/post');
const Hobby = require('../model/hobby');

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull
} = graphql;


// dummy data
// const usersData = [
//      {id: '1', name: 'Bond', age: 36, profession: 'Programmer'},
//      {id: '13', name: 'Anna', age: 26, profession: 'Baker'},
//      {id: '211', name: 'Bella', age: 16, profession: 'Mechanic'},
//      {id: '19', name: 'Gina', age: 26, profession: 'Painter'},
//      {id: '150', name: 'Georgina', age: 36, profession: 'Teacher'}
// ];

// const hobbiesData = [
//     {id: '1', title: 'Programming', description: 'Using computers to make the world a better place', userId: '150'},
//     {id: '2', title: 'Rowing', description: 'Sweat and feel better before eating donouts', userId: '211'},
//     {id: '3', title: 'Swimming', description: 'Get in the water and learn to become the water', userId: '211'},
//     {id: '4', title: 'Fencing', description: 'A hobby for fency people', userId: '13'},
//     {id: '5', title: 'Hiking', description: 'Wear hiking boots and explore the world', userId: '150'},
// ];

// const postsData = [
//     {id: '1', comment: 'Building a Mind', userId: '1'},
//     {id: '2', comment: 'GraphQL is Amazing', userId: '1'},
//     {id: '3', comment: 'How to Change the World', userId: '19'},
//     {id: '4', comment: 'How to Change the World', userId: '211'},
//     {id: '5', comment: 'How to Change the World', userId: '1'}
// ]

// types
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'Docs for user',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    profession: {type: GraphQLString},

    posts: {
      type: new GraphQLList(PostType),
      resolve(parent, args){
        return Post.find({userId: parent.id});
      }
    },

    hobbies: {
      type: new GraphQLList(HobbyType),
      resolve(parent, args){
        return Hobby.find({userId: parent.id});
      }
    }
  })
});

const HobbyType = new GraphQLObjectType({
  name: 'Hobby',
  description: 'Users hobbies',
  fields: () => ({
    id: {type:GraphQLID},
    title: { type: GraphQLString},
    description: { type: GraphQLString},
    user: { 
      type: UserType,
      resolve (parent, args){
        return User.findById(parent.userId);
      }
    } 
  })
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'Users Posts',
  fields: () => ({
    id: {type:GraphQLID},
    comment: { type: GraphQLString},
    user: {
      type: UserType,
      resolve (parent, args) {
        return User.findById(parent.userId);
      } 
    }
  })
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Description',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {type: GraphQLID}
            },
            resolve(parent, args){
                // Here we resolve with data. Get and return data from data source
                return User.findById(args.id);
            }
        },

        users: {
          type: new GraphQLList(UserType),
          resolve(parent, args){
            return User.find({});
          }
        },

        hobby: {
            type: HobbyType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
              return Hobby.findById(args.id);
            }
        },

        hobbies: {
          type: new GraphQLList(HobbyType),
          resolve(parent, args){
            return Hobby.find({});
          }
        },
        post: {
          type: PostType,
          args: {id: {type: GraphQLID}},
          resolve(parent, args){
            return Post.findById(args.id);
          }
        },
        posts: {
          type: new GraphQLList(PostType),
          resolve(parent, args){
            return Post.find({});
          }
        }
      
    }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: UserType,
      args: {
        name:{type: new GraphQLNonNull(GraphQLString)},
        age: {type: GraphQLInt},
        profession: {type: GraphQLString}
      },

      resolve(parent,args){
        const user = new User({
          name : args.name,
          age : args.age,
          profession : args.profession
        });

        // saving to db

        user.save();

        return user;
  
      }
    },

    updateUser: {
      type: UserType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        profession: {type: GraphQLString},
      },
      resolve(parent, args){
        return User.findByIdAndUpdate(args.id,
          {
            $set: {
              name: args.name,
              age: args.age,
              profession: args.profession
            }
          },
          {new: false} // This is for returning the new updated object (See Mongoose documentation)
          );
      }
    },
    
    deleteUser: {
      type: UserType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
      },

      resolve(parent,args){
        const deletedUser = User.findByIdAndDelete(args.id).exec();
        if (!deletedUser) throw new ('Error');
        return deletedUser;
      }
    },

    createPost: {
      type: PostType,
      args: {
        comment:{type: new GraphQLNonNull(GraphQLString)},
        userId: {type: GraphQLID}
      },

      resolve(parent,args){
        const post = new Post({
          comment : args.comment,
          userId : args.userId,
        });
  
        post.save();

        return post; 
      }
    },

    updatePost: {
      type: PostType,
      args: {
        id : { type: new GraphQLNonNull(GraphQLID)},
        comment : {type: GraphQLString},
      },
      resolve(parent, args){
        return Post.findByIdAndUpdate(args.id,
          {
            comment: args.comment,
          },
          {new: false});
      }
    },

    deletePost: {
      type: PostType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
      },

      resolve(parent,args){
        const deletedPost = Post.findByIdAndDelete(args.id).exec();
        if (!deletedPost) throw new ('Error');
        return deletedPost;
      }
    },

    createHobby: {
      type: HobbyType,
      args: {
        title:{type: GraphQLNonNull(GraphQLString)},
        description: {type: GraphQLString},
        userId: {type: GraphQLString}
      },

      resolve(parent,args){
        const hobby = new Hobby({
          title : args.title,
          description : args.description,
          userId : args.userId
        });
  
        hobby.save();

        return hobby;
      }
    },

    updateHobby: {
      type: HobbyType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
        title: {type: GraphQLString},
        description : {type: GraphQLString},
        userId : {type: GraphQLString}
      },

      resolve(parent, args){
        return Hobby.findByIdAndUpdate(args.id, 
          {
            title: args.title,
            description: args.description,
            userId: args.userId
          },
          {new: false});
      }
    },

    deleteHobby: {
      type: HobbyType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
      },

      resolve(parent,args){
        const deletedHobby = Hobby.findByIdAndDelete(args.id).exec();
        if (!deletedHobby) throw new ('Error');
        return deletedHobby;
      }
    },

  }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
}); 
