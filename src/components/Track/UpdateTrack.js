import React,{ useState, useContext } from "react";
import { Mutation } from 'react-apollo';
import { gql } from 'apollo-boost';
import axios from 'axios';
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";

import { GET_TRACKS_QUERY } from '../../pages/App';
import {UserContext} from '../../Root';
import Error   from '../Shared/Error';


const UpdateTrack = ({ classes , track }) => {

    const currentUser = useContext(UserContext);

     const [open, setOpen] = useState(false);
     const [title, setTitle] = useState(track.title);
     const [file, setFile] = useState("");
     const [description, setDescription] = useState(track.description);
     const [submitting, setSubmitting] = useState(false);
     const [fileError, setFileError]   = useState("");

     const isCurrentUser = currentUser.id === track.postedBy.id;

     const handleAudioChange = event => {
      const selectedFile =  event.target.files[0];
      var fileSizeLimit  = 10000000;
      if (selectedFile && selectedFile.size > fileSizeLimit){
        setFileError(`$(selectedFile.name): File size too large`);
      }else{ 
        setFile(selectedFile);
        setFileError("")
     }
}


     const handleAudioUpload = async () => {
         var data = new FormData()
         data.append('file', file)
         data.append('resource_type', 'raw')
         data.append('upload_preset', 'react-tracks')
         data.append('cloud_name', 'emmabreezy25')
         const res = await axios.post('https://api.cloudinary.com/v1_1/emmabreezy25/raw/upload', data)
         return res.data.url;
     }

     const handleSubmit = async (event, updateTrack) => {
      event.preventDefault();
      setSubmitting(true)
      try{
        const uploadedUrl = await handleAudioUpload()
        console.log(uploadedUrl);
        updateTrack( { variables: { trackId:track.id, title, description, url: uploadedUrl } })
      } catch(err) {
          console.error('Error uploading file', err);
          setSubmitting(false);
          setOpen(false);
          alert("Error occured")
        }
     }

  return isCurrentUser &&  (
    <React.Fragment>
      <IconButton onClick={() => setOpen(true)}>
         <EditIcon />
      </IconButton>
    {/*  */}
    <Mutation mutation={ UPDATE_TRACK_MUTATION }
      onCompleted={data => {
        setSubmitting(false);
        setOpen(false);
        // setTitle("");
        // setDescription("");
        // setFile("");
      }}
      refetchQueries={ () => [{ query: GET_TRACKS_QUERY }]}
    >
       {(updateTrack, {loading,error}) => {
          if(error) return  <Error error={error} />

        return (
            <Dialog open={open} className={classes.dialog}>
              <form onSubmit={ event => handleSubmit(event, updateTrack) }>
                <DialogTitle> Update Track </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                      Add a Title, Description & Audio File
                      (Under 10MB)
                  </DialogContentText>
                  <FormControl fullWidth>
                    <TextField 
                        label="Title"
                        placeholder="Add Title"
                        className={classes.textField}
                        onChange={(event) => setTitle(event.target.value)}
                        value={title}
                    />
                  </FormControl>
                   <FormControl fullWidth>
                    <TextField 
                        multiline
                        rows="4"
                        label="Description"
                        placeholder="Add Description"
                        className={classes.textField}
                        onChange={(event) => setDescription(event.target.value)}
                        value={description}
                    />
                  </FormControl>
                   <FormControl fullWidth error={Boolean(fileError)}>
                      <input id="audio" required type="file" accept="audio/*" className={classes.input} onChange={handleAudioChange}  /> 
                      <label htmlFor="audio">
                        <Button variant="outlined" color={file ? 'secondary' : 'inherit'} component="span" className={classes.button}> 
                          Audio File 
                          <LibraryMusicIcon className={classes.icon} />
                      </Button>
                      {file && file.name}
                       <FormHelperText>
                          { fileError }
                       </FormHelperText>
                      </label>
                  </FormControl>
                </DialogContent>
                <DialogActions> 
                  <Button className={classes.cancel} onClick={() => setOpen(false)} disabled={submitting}> 
                    Cancel
                  </Button>
                  <Button className={classes.save} type="submit" disabled={submitting || !title.trim() || !description.trim() || !file }> 
                    { submitting ? (
                        <CircularProgress className={classes.save} size={24} />
                      ) : "Update Track" } 
                  </Button>

                </DialogActions>
              </form>
            </Dialog>
        );
       }}
      </Mutation>
    </React.Fragment>
  );
}

const UPDATE_TRACK_MUTATION = gql`
  mutation($trackId: Int!, $title: String, $description: String, $url: String){
    updateTrack(trackId:$trackId, title:$title, description:$description, url:$url){
      track {
          id
          title
          description
          url
          likes{
            id
          }
          postedBy{
            id 
            username
            }
  }
    }
  }

`

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing(1)
  },
  cancel: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing(1)
  },
  icon: {
    marginLeft: theme.spacing(1)
  },
  input: {
    display: "none"
  }
});

export default withStyles(styles)(UpdateTrack);
