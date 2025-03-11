import React, { useState, useEffect } from "react";
import './dashboard.css'
import axios from "axios";
import { 
  Button, 
  TextField, 
  Typography, 
  IconButton, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Alert, 
  CircularProgress 
} from "@mui/material";
import { Edit, Delete, Add, Book } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SubjectManagement = () => {
  // State variables
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: "", total_lectures: 0 });
  const [editingSubject, setEditingSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem("userid");
  const token = localStorage.getItem("token");

  // Set up axios authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Function to fetch all subjects for the user
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/subjects?userId=${userId}`);
      setSubjects(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Failed to fetch subjects.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "total_lectures") {
      // Ensure total_lectures is a number
      setNewSubject({ ...newSubject, [name]: parseInt(value) || 0 });
    } else {
      setNewSubject({ ...newSubject, [name]: value });
    }
  };

  // Add a new subject
  const handleAddSubject = async () => {
    if (newSubject.name && newSubject.total_lectures > 0) {
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:5000/subject", newSubject);
        setSubjects([...subjects, response.data]);
        setNewSubject({ name: "", total_lectures: 0 });
        setSuccess("Subject added successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error("Error adding subject:", err);
        setError(err.response?.data?.message || "Failed to add subject.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please fill in all fields correctly.");
    }
  };

  // Open the edit dialog with subject data
  const handleOpenEditDialog = (subject) => {
    setEditingSubject(subject);
    setNewSubject({ 
      name: subject.name, 
      total_lectures: subject.total_lectures 
    });
    setOpenDialog(true);
  };

  // Close the edit dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubject(null);
    setNewSubject({ name: "", total_lectures: 0 });
  };

  // Edit an existing subject
  const handleEditSubject = async () => {
    if (newSubject.name && newSubject.total_lectures > 0) {
      setLoading(true);
      try {
        const response = await axios.put(
          `http://localhost:5000/subject/${editingSubject.id}`,
          newSubject
        );
        
        // Update the subjects list
        setSubjects(
          subjects.map((subject) =>
            subject.id === editingSubject.id 
              ? { ...subject, ...newSubject } 
              : subject
          )
        );
        
        setSuccess("Subject updated successfully!");
        handleCloseDialog();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error("Error updating subject:", err);
        setError(err.response?.data?.message || "Failed to update subject.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please fill in all fields correctly.");
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteConfirm = (id, e) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmId(null);
  };

  // Delete a subject
  const handleDeleteSubject = async () => {
    if (!deleteConfirmId) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/subject/${deleteConfirmId}`);
      setSubjects(subjects.filter((subject) => subject.id !== deleteConfirmId));
      setSuccess("Subject deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      handleCloseDeleteConfirm();
    } catch (err) {
      console.error("Error deleting subject:", err);
      setError(err.response?.data?.message || "Failed to delete subject.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to subject details page
  const handleSubjectClick = (id) => {
    navigate(`/courseOutline/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Subjects
      </Typography>
      
      {/* Error and Success messages */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
      
      {/* Add Subject Form */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add New Subject
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subject Name"
                name="name"
                value={newSubject.name}
                onChange={handleInputChange}
                required
                error={!newSubject.name}
                helperText={!newSubject.name ? "Subject name is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Lectures"
                name="total_lectures"
                type="number"
                value={newSubject.total_lectures}
                onChange={handleInputChange}
                required
                error={newSubject.total_lectures <= 0}
                helperText={newSubject.total_lectures <= 0 ? "Must be greater than 0" : ""}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddSubject}
            disabled={loading || !newSubject.name || newSubject.total_lectures <= 0}
          >
            {loading ? <CircularProgress size={24} /> : "Add Subject"}
          </Button>
        </CardActions>
      </Card>
      
      {/* Subjects List */}
      <Typography variant="h5" gutterBottom>
        Your Subjects
      </Typography>
      
      {loading && !subjects.length ? (
        <CircularProgress />
      ) : subjects.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No subjects found. Add your first subject above.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {subjects.map((subject) => (
            <Grid item xs={12} sm={6} md={4} key={subject.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleSubjectClick(subject.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Book color="primary" sx={{ mb: 1, fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    {subject.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {subject.total_lectures} {subject.total_lectures === 1 ? 'lecture' : 'lectures'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDialog(subject);
                    }}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={(e) => handleOpenDeleteConfirm(subject.id, e)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Edit Subject Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Subject</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject Name"
                name="name"
                value={newSubject.name}
                onChange={handleInputChange}
                required
                error={!newSubject.name}
                helperText={!newSubject.name ? "Subject name is required" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Lectures"
                name="total_lectures"
                type="number"
                value={newSubject.total_lectures}
                onChange={handleInputChange}
                required
                error={newSubject.total_lectures <= 0}
                helperText={newSubject.total_lectures <= 0 ? "Must be greater than 0" : ""}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleEditSubject} 
            variant="contained" 
            color="primary"
            disabled={loading || !newSubject.name || newSubject.total_lectures <= 0}
          >
            {loading ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this subject? This action cannot be undone 
            and will also delete all chapters, topics, and lectures associated with this subject.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button 
            onClick={handleDeleteSubject} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubjectManagement;