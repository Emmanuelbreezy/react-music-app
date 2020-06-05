import React,{useState} from "react";
import { Mutation } from 'react-apollo';
import  { gql} from 'apollo-boost';
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import FormControl from "@material-ui/core/FormControl";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import Lock from "@material-ui/icons/Lock";

const Login = ({ classes, setNewUser }) => {
     const [username, setUsername] = useState("")
     const [password, setPassword] = useState("")

     const handleSubmit = async (event,tokenAuth,client) =>{
      event.preventDefault();
       try{
           const  res = await tokenAuth();
           localStorage.setItem('authToken', res.data.tokenAuth.token);
           client.writeData({ data: { isLoggedIn: true } })
      }catch{
            console.log('[ERROR LOGIN]');
            alert('[USER DETAIL IS INVALID]');
        }
     }

  return (
       <div className={classes.root}>
        <Paper className={classes.paper}> 
          <Avatar className={classes.avatar}>
            <Lock />
          </Avatar>
          <Typography>
              Login as Existing User
          </Typography>
         
           <Mutation mutation={ LOGIN_MUTATION }
                variables={{ username,password }}
             >
              { (tokenAuth, { loading, error,called, client }) => {
                return (
                  <form onSubmit={(event) => handleSubmit(event,tokenAuth,client)} className={ classes.form }>
                    <FormControl margin="normal" required fullWidth>
                      <InputLabel htmlFor="username">Username</InputLabel>
                      <Input id="username" type="text" onChange={event=> setUsername(event.target.value)}/>
                    </FormControl>

                    <FormControl margin="normal" required fullWidth>
                      <InputLabel htmlFor="password">Password</InputLabel>
                      <Input id="password" type="password"  onChange={event=> setPassword(event.target.value)}/>
                    </FormControl>
                    <br />
                    <Button type="submit"   variant="contained" color="primary" className={classes.submit} 
                            fullWidth disabled={loading || !username.trim() ||  !password.trim() }>
                      {loading ? "Logging..." : "Login"}
                    </Button>
                    <Button  onClick={() => setNewUser(true)} color="secondary" variant="outlined" fullWidth>
                      New user? Register here
                    </Button>
                  {/* Error handling*/}
                  {error && <div>Error</div> }
                  </form>

                  );
                }}
                </Mutation>
                
        </Paper>
      </div>
    );
};

const LOGIN_MUTATION = gql`
  mutation($username:String!,$password:String!)
  {
    tokenAuth(username:$username,password:$password)
    {
      token
    }
  }
`

const styles = theme => ({
  root: {
    width: "auto",
    display: "block",
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up("md")]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(2)
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.secondary.main
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1)
  },
  submit: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
});

export default withStyles(styles)(Login);
