import React,{ Suspense } from "react";
import { Query } from 'react-apollo';
import  { gql } from 'apollo-boost';
import { BrowserRouter as Router, Switch,Route } from 'react-router-dom';
import withRoot from "./withRoot";
import App from './pages/App';
import Profile from './pages/Profile';
import Header from './components/Shared/Header';
import Loading from './components/Shared/Loading';
import Error from './components/Shared/Error';

export const UserContext = React.createContext()

const Root = () => (
	<Query query={ME_QUERY}  fetchPolicy='cache-and-network'>
		{({ data, loading, error }) => {
			if(loading) return (<Loading />)
			if (error)  return (<Error />)
			 const currentUser = data.me;
			const routeLinks = (
					<UserContext.Provider value={currentUser}>
						   <Header currentUser={currentUser} />
							<Switch>
								<Route path="/" exact component={App} />
								<Route path="/profile/:id" exact component={Profile} />
							</Switch>
					</UserContext.Provider>
				);
			return (
				<Router basename="/app">
					<Suspense fallback={<div>Loading</div>}>{routeLinks}</Suspense>
				</Router>
			);
		}}
	</Query>
);

// const GET_TRACKS_QUERY = gql`
// 	{
// 		tracks{
// 			id
// 			title
// 			description
// 			url
// 		}

// 	}

// `

export const ME_QUERY = gql`

 {
 	me{
 		id
 		username
 		likeSet{
 			track{
 				id
 			}
 		}
 	}
 }



`

export default withRoot(Root);
