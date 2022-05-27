import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import {DataGrid} from '@mui/x-data-grid';
import Grid from '@mui/material/Grid';  
import {DataGrid} from '@mui/x-data-grid';
import {SERVER_URL} from '../constants.js'

// NOTE:  for OAuth security, http request must have
//   credentials: 'include' 
//

class Assignment extends React.Component {
    constructor(props) {
      super(props);
      this.state = {selected: 0, assignments: []};
    };
 
   componentDidMount() {
    this.fetchAssignments();
  }
 
 // fetch assignments
  fetchAssignments = () => {
    console.log("Assignment.fetchAssignments");
    const token = Cookies.get('XSRF-TOKEN');
    fetch(`${SERVER_URL}/gradebook`, 
      {  
        method: 'GET', 
        headers: { 'X-XSRF-TOKEN': token }
      } )
    .then((response) => response.json()) 
    .then((responseData) => { 
      if (Array.isArray(responseData.assignments)) {
        console.log(responseData.assignments);
        //  add to each assignment an "id"  This is required by DataGrid  "id" is the row index in the data grid table 
        this.setState({ assignments: responseData.assignments.map((assignment, index) => ( { id: index, ...assignment } )) });
      } else {
        toast.error("Fetch failed.", {
          position: toast.POSITION.BOTTOM_LEFT
        });
      }        
    })
    .catch(err => console.error(err)); 
  }
  
   // when create assignment button pressed, send POST, assignment to back end 
    handleCreate = ( ) => {
      console.log("Assignment.handleCreate");
      const token = Cookies.get('XSRF-TOKEN');
      
      fetch(`${SERVER_URL}/course/${this.state.courseId}/assignment`, 
          {  
            method: 'POST', 
            headers: { 'Content-Type': 'application/json',
                       'X-XSRF-TOKEN': token }, 
            body: JSON.stringify({assignmentName: this.state.name,  dueDate: this.state.dueDate, courseId: this.state.courseId})
          } )
      .then(res => {
          if (res.ok) {
            toast.success("Assignment Created Successfully ", {
            position: toast.POSITION.BOTTOM_LEFT
            });
            this.fetchAssignments();
          } else {
            toast.error("Create Assignment failed", {
            position: toast.POSITION.BOTTOM_LEFT
            });
            console.error('Put http status =' + res.status);
      }})
        .catch(err => {
          toast.error("Create Assignment failed", {
            position: toast.POSITION.BOTTOM_LEFT
          });
          console.error(err);
        });
   };        
  
   onRadioClick = (event) => {
    console.log("Assignment.onRadioClick " + event.target.value);
    this.setState({selected: event.target.value});
  }

  onNameChange = (e) => {
    console.log("Assignment.onNameChange " + e.target.value);
    this.setState({name: e.target.value});
  }

  onDateChange = (e) => {
    console.log("Assignment.onDateChange " + e.target.value);
    this.setState({dueDate: e.target.value});
  }

  onCourseIdChange = (e) => {
    console.log("Assignment.onCourseIDChange " + e.target.value);
    this.setState({courseId: e.target.value});
  }
  
  render() {
     const columns = [
      {
        field: 'assignmentName',
        headerName: 'Assignment',
        width: 400,
        renderCell: (params) => (
          <div>
          <Radio
            checked={params.row.id === this.state.selected}
            onChange={this.onRadioClick}
            value={params.row.id}
            color="default"
            size="small"
          />
          {params.value}
          </div>
        )
      },
      { field: 'courseTitle', headerName: 'Course', width: 300 },
      { field: 'courseId', headerName: 'Course ID', width: 200 },
      { field: 'dueDate', headerName: 'Due Date', width: 200 }
      ];
      
      const assignmentSelected = this.state.assignments[this.state.selected];
      return (
          <div align="left" >
            <h4>Assignment(s) ready to grade: </h4>
              <div style={{ height: 450, width: '100%', align:"left"   }}>
                <DataGrid rows={this.state.assignments} columns={columns} />
              </div>
              <div>
              	<Button component={Link} to={{pathname:'/gradebook',   assignment: assignmentSelected }} 
              		variant="outlined" color="primary" disabled={this.state.assignments.length===0}  style={{margin: 10}}>
              	Grade
              	</Button>
                <hr></hr>
              </div>
              <div align="center">
                <h3>Create Assigments</h3>
                <label for="assignmentName">Name: </label>
                <input type="text" id="assignmentName" name="assignmentName" onChange={this.onNameChange}></input><br></br>
                <label for="assignmentDueDate">Date Due: </label>
                <input type="text" id="dueDate" name="dueDate" onChange={this.onDateChange}></input><br></br>
                <label for="courseId">Course ID: </label>
                <input type="number" id="courseId" name="courseId" onChange={this.onCourseIdChange}></input><br></br>
              </div>
              <div align="center">
                <Button variant="outlined" color="primary" style={{margin: 10}} onClick={this.handleCreate} >
                   Create Assignment
                </Button>
              </div>                              
            <ToastContainer autoClose={1500} /> 
          </div>
      )
  }
}  

export default Assignment;