import * as React from "react";
import {
  addPostServer,
  deletePostServer,
  editPostServer,
  getPosts,
} from "../services/httpService";
import { PostTypes } from "./actionTypes/PostTypes";
import postReducer, { Data, PostAction, PostState } from "./postReducer";

type PostProviderProps = {
  children: React.ReactNode;
};

const PostsContext = React.createContext<{
  posts: PostState;
  dispatch: React.Dispatch<PostAction>;
}>({
  posts: { error: false, data: [], loading: false },
  dispatch: () => undefined,
});

const initialState: PostState = { error: false, data: [], loading: false };

export function PostProvider({ children }: PostProviderProps) {
  const [posts, dispatch] = React.useReducer<
    React.Reducer<PostState, PostAction>
  >(postReducer, initialState);

  return (
    <PostsContext.Provider value={{ posts, dispatch }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePost() {
  const context = React.useContext(PostsContext);
  if (!context) {
    throw new Error(`useCount must be used within a CountProvider`);
  }
  const { posts, dispatch } = context;

  const initializeData = async () => {
    dispatch({ type: PostTypes.LOADING_DATA, payload: [] });
    try {
      const response = await getPosts();
      dispatch({ type: PostTypes.SUCCESSFULL_DATA, payload: response });
    } catch (e: any) {
      dispatch({ type: PostTypes.ERROR_DATA, payload: e.message });
    }
  };

  const deletePost = async (id: number) => {
    try {
      await deletePostServer(id);
      const updatedPosts: Data[] = posts.data.filter((post) => post.id !== id);
      dispatch({ type: PostTypes.SUCCESSFULL_DATA, payload: updatedPosts });
    } catch (e: any) {
      dispatch({ type: PostTypes.ERROR_DATA, payload: e.message });
    }
  };

  const addPost = async (newObj: Data) => {
    try {
      const response = await addPostServer(newObj);
      if (response) {
        newObj.id = Math.random();
        const updatedPosts: Data[] = [newObj, ...posts.data];
        dispatch({ type: PostTypes.SUCCESSFULL_DATA, payload: updatedPosts });
      }
    } catch (e: any) {
      dispatch({ type: PostTypes.ERROR_DATA, payload: e.message });
    }
  };
  const editPost = async (newObj: Data) => {
    try {
      const response = await editPostServer(newObj);
      if (response) {
        const updatedPosts: Data[] = posts.data.map((post: Data) =>
          post.id === newObj.id ? newObj : post
        );
        dispatch({ type: PostTypes.SUCCESSFULL_DATA, payload: updatedPosts });
      }
    } catch (e: any) {
      dispatch({ type: PostTypes.ERROR_DATA, payload: e.message });
    }
  };

  return {
    posts,
    dispatch,
    initializeData,
    deletePost,
    editPost,
    addPost,
  };
}
