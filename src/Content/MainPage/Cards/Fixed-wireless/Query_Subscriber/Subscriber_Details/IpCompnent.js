import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {FormGroup, FormControl, FormLabel} from "react-bootstrap";
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue} from "firebase/database";
import "react-toggle/style.css";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import MapIPAddress from './mapIPAddress';
import { useSpring, animated } from 'react-spring/web.cjs'; 
import axios from 'axios';
import {login} from '../../../../../../redux_features/authSlice';


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }
  
const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        
    },
    paper: {
        marginLeft:'25em',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        width: '60%'
    },
    paper_map: {
        marginLeft:'8em',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        },
        Formlabel: {
        fontStyle: 'Muli',
        fontWeight: 'bold',
        
        },
    }));

const Fade = React.forwardRef(function Fade(props, ref) {
    const { in: open, children, onEnter, onExited, ...other } = props;
    const style = useSpring({
        from: { opacity: 0 },
        to: { opacity: open ? 1 : 0 },
        onStart: () => {
        if (open && onEnter) {
            onEnter();
        }
        },
        onRest: () => {
        if (!open && onExited) {
            onExited();
        }
        },
    });

    return (
        <animated.div ref={ref} style={style} {...other}>
        {children}
        </animated.div>
    );
});

Fade.propTypes = {
children: PropTypes.element,
in: PropTypes.bool.isRequired,
onEnter: PropTypes.func,
onExited: PropTypes.func,
};



const IpComponent = (props) => {
    const {subscriber_name} = props;
    const {authen_token} = useSelector(login).payload.authentication.auth.token;
    const {ip} = props;
    const [show, setShow] = useState(false);
    const handleClose = () => setErrorshow(false);
    const handleClose1 = () => setShow(false);
    const [NewIPAddress, setNewIPAddress] = useState("");
    const [pop_array, setpop_array] = useState([]);
    const [Errorshow, setErrorshow] = useState(false);
    const [SubIp , setSubIp] = useState(ip);
    const [, setapiResponse] = useState("");
    const [pop, setpop] = useState("Select POP");
    const [changeLoading, setchangeLoading] = useState("Change")
    const classes = useStyles();
    const IPchangeModal = (event) => {
        setShow(true)
        event.preventDefault();
    }
    const firebaseConfig = {
        apiKey: "apiKey",
        authDomain: "projectId.firebaseapp.com",
        databaseURL: "https://work-tools-d6176-default-rtdb.firebaseio.com/",
        storageBucket: "bucket.appspot.com"
      };
      
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    
    useEffect(() => {
        const POP = ref(database, '/FWB/create_subscriber/POP');
        onValue(POP, (snapshot) => {
            const data = snapshot.val();
            setpop_array(data)
          });
      }, [])

    function ChangeSubscriberIPapi(){
        axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
         axios({
             method: 'POST',
             url:'http://192.168.6.253:32598/fwb/changeipaddress',
             data:{
                "name": subscriber_name,
                "Old_ip": SubIp,
                "new_ip": NewIPAddress,
                "new_subnetID": pop

             },
             headers:{
               'Authorization': 'Bearer '+ authen_token
             }
         }) 
         .then(function(response){
                 setapiResponse(response.data);
                 setchangeLoading("Change")
                 setSubIp(NewIPAddress);
                 handleClose1()

                 
         }) 
         .catch(err=>{
                 setErrorshow(true)
                 setchangeLoading("Change")
         })
     }
    function handleSubmit(event) {
        setchangeLoading("Processing")
        ChangeSubscriberIPapi();
        event.preventDefault();
        }
    function validateForm() {
        return NewIPAddress.length > 0 ;
        }

    return (
        <div>
                 <Modal
                aria-labelledby="spring-modal-title"
                aria-describedby="spring-modal-description"
                className={classes.modal}
                open={show}
                onClose={handleClose1}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                timeout: 500,
                }}
            >
                <Fade in={show}>
                
                </Fade>
        </Modal>
        <Snackbar open={Errorshow} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity="error">
            An error occured please try again later
            </Alert>
        </Snackbar>

        <form onSubmit={IPchangeModal}>
            <Row style={{padding:"5px"}}>
            <Col>{SubIp}</Col>
            <Col style={{display:'flex', justifyContent:'flex-end'}}>
            <MapIPAddress name='Change'>
                <div className='new-ip'>
                    <form onSubmit={handleSubmit}>
                        <h2 className='sidebar-title'>Change IP Address</h2>
                        <div className='sidebar-body'>
                        <Row>
                            <Col>
                                <FloatingLabel
                                controlId="IPAddress"
                                label="IP Address"
                                className="mb-3"
                                >
                                    <Form.Control
                                        placeholder="4.4.4.4"
                                        type="text"
                                            value={NewIPAddress}
                                            onChange={e => setNewIPAddress(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>

                        <Row>
                        <Col>
                        <FloatingLabel
                            controlId="pop"
                            label="POP Location"
                            className="mb-3"
                        >
                            <Form.Select
                            value={pop}
                            onChange={e => setpop(e.target.value)}
                            >
                            {pop_array.map((option, id) =>
                                (
                                <option>{option}</option>
                                ))}
                            </Form.Select>
                        </FloatingLabel>
                        </Col>
                        </Row>
                        <div className='sidebar-button-div'>
                                <Button className='sidebar-button' block disabled={!validateForm()} type="submit">
                                    {changeLoading}
                                </Button>
                        </div> 
                        </div>
                    </form> 
                </div>
            </MapIPAddress>
            </Col>
            </Row>                         
        </form>
    </div>
    )
}

export default IpComponent;
