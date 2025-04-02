import { useState, useEffect, useCallback } from "react";
import potatoLeaf from './potato-leaf.jpg';
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { 
  Paper, 
  CardActionArea, 
  CardMedia, 
  Grid, 
  TableContainer, 
  Table, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell, 
  Button, 
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Box
} from "@material-ui/core";

import { useDropzone } from 'react-dropzone';
import { common } from '@material-ui/core/colors';
import Clear from '@material-ui/icons/Clear';
import TranslateIcon from '@material-ui/icons/Translate';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

// Import WebcamCapture component
import WebcamCapture from './WebcamCapture';

// Import language files
import enTranslations from './languages/en.json';
import hiTranslations from './languages/hi.json';
import mrTranslations from './languages/mr.json';

const axios = require("axios").default;

// Create a map of available translations
const translationMap = {
  en: enTranslations,
  hi: hiTranslations,
  mr: mrTranslations
};

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  clearButton: {
    width: "-webkit-fill-available",
    borderRadius: "12px",
    padding: "12px 19px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
    backgroundColor: common.white,
    '&:hover': {
      backgroundColor: '#ffffff',
    },
  },
  root: { maxWidth: 345, flexGrow: 1 },
  media: { height: 400 },
  gridContainer: { justifyContent: "center", padding: "4em 1em 0 1em" },
  mainContainer: {
    backgroundImage: `url(${potatoLeaf})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    minHeight: '100vh',
    zIndex: -1,
  },
  imageCard: {
    margin: "auto",
    maxWidth: 500,
    height: 1150,
    backgroundColor: 'transparent',
    boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important',
    borderRadius: '15px',
    marginTop: '2em',
  },
  imageCardEmpty: { height: 'auto' },
  detail: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '20px',
  },
  appbar: { 
    background: '#e6e07e', 
    boxShadow: 'none', 
    color: 'black',
    height:'80px' 
  },
  loader: { color: '#be6a77 !important' },
  languageForm: {
    minWidth: 120,
    margin: theme.spacing(1),
  },
  languageSelect: {
    color: '#ff5d00',
    '&:before': {
      borderColor: 'white',
    },
    '&:after': {
      borderColor: 'white',
    },
  },
  languageIcon: {
    color: '#ff5d00',
    marginRight: theme.spacing(1),
    
  },
  languageLabel: {
    color: '#ff5d00',
  },
  dropzoneContainer: {
    border: '2px dashed #888',
    padding: '20px',
    cursor: 'pointer',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '10px',
  },
  title: {
    flexGrow: 1,
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
  },
  detailsHeader: {
    marginTop: '1em',
    borderBottom: '2px solidrgb(174, 249, 156)',
    paddingBottom: '0.5em',
    width: '100%',
  },
  detailSection: {
    marginBottom: '1.5em',
    width: '100%',
  },
  listItem: {
    marginBottom: '8px',
  },
  confidentText: {
    color: '#2e7d32', // Green for high confidence
  },
  moderateText: {
    color: '#ff9800', // Orange for moderate confidence
  },
  lowText: {
    color: '#f44336', // Red for low confidence
  },
  tabRoot: {
    flexGrow: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '10px 10px 0 0',
  },
  tabIndicator: {
    backgroundColor: '#ff5d00',
  },
}));

const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [tabValue, setTabValue] = useState(0);
  
  let confidence = 0;

  // Get current translations
  const t = translationMap[language] || translationMap.en;

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    // If we already have data, update display with the new language
    if (data && selectedFile) {
      sendFile(newLanguage);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      // Clear any previous preview
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(undefined);
      }
      
      setSelectedFile(acceptedFiles[0]);
      setImage(true);
      setData(undefined);
      
      // Create preview URL for the dropped file
      const objectUrl = URL.createObjectURL(acceptedFiles[0]);
      setPreview(objectUrl);
    }
  }, [preview]);

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: 'image/*',
    multiple: false
  });

  // Handle image capture from WebcamCapture component
  const handleCameraCapture = (file, previewUrl) => {
    // Clean up any existing preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    
    setSelectedFile(file);
    setPreview(previewUrl);
    setImage(true);
    setData(undefined);
    setTabValue(0); // Switch back to the main tab
  };

  // Function to preprocess image file before sending
  const preprocessImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Draw and resize the image to 256x256
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 256, 256);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const preprocessedFile = new File([blob], file.name, { type: "image/jpeg" });
            resolve(preprocessedFile);
          } else {
            reject(new Error("Failed to preprocess image"));
          }
        }, 'image/jpeg', 0.95);
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return classes.confidentText;
    if (confidence >= 50) return classes.moderateText;
    return classes.lowText;
  };

  const sendFile = useCallback(async (currentLanguage = language) => {
    if (image && selectedFile) {
      setIsLoading(true);
      const formData = new FormData();
      
      try {
        // Preprocess the image to 256x256 before sending
        const preprocessedFile = await preprocessImage(selectedFile);
        formData.append("file", preprocessedFile);
        
        const res = await axios.post(
          `http://localhost:8000/predict?lang=${currentLanguage}`, 
          formData
        );
        
        if (res.status === 200) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Error uploading the file:", error);
        // Get error message from current language translations
        const errorMsg = translationMap[currentLanguage]?.uploadError || translationMap.en.uploadError;
        alert(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
  }, [image, selectedFile, language]);
  
  const clearData = () => {
    // Clean up preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Clean up the preview URL when component unmounts
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  useEffect(() => {
    if (!preview) return;
    
    // If the preview exists but image is not set, make sure to set it
    if (!image && preview) {
      setImage(true);
    }
    
    // Only send the file if we have a preview URL and a selected file
    if (selectedFile) {
      sendFile();
    }
  }, [preview, selectedFile, sendFile, image]);

  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  const getLanguageName = (code) => {
    // Get language names from translations
    return t.languageNames[code] || code;
  };

  // Get translated disease name based on class and current language
  const getTranslatedDiseaseName = (className) => {
    if (!className) return "";
    
    // Get disease translation from current language
    return t.diseases[className] || formatClassName(className);
  };

  // Format disease class name for better display (used as fallback)
  const formatClassName = (className) => {
    if (!className) return "";
    return className
      .replace(/__/g, " - ")
      .replace(/_/g, " ")
      .replace(/healthy/i, "Healthy")
      .replace(/Early_blight/i, "Early Blight")
      .replace(/Bacterial_spot/i, "Bacterial Spot");
  };

  // Create camera-specific translations for WebcamCapture
  const cameraTranslations = {
    startCamera: t.startCamera || "Start Camera",
    captureImage: t.captureImage || "Take Photo",
    stopCamera: t.stopCamera || "Stop Camera",
    cameraInstructions: t.cameraInstructions || "Position leaf in center of frame",
    cameraNotSupported: t.cameraNotSupported || "Camera not supported on this device",
    cameraAccessError: t.cameraAccessError || "Error accessing the camera",
    cameraPermissionDenied: t.cameraPermissionDenied || "Camera permission denied",
    cameraNotFound: t.cameraNotFound || "Camera not found",
    selectCamera: t.selectCamera || "Select Camera",
    refreshCameraList: t.refreshCameraList || "Refresh Camera List"
  };

  // For debugging
  console.log("Preview URL:", preview);
  console.log("Image state:", image);
  console.log("Selected file:", selectedFile?.name);

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            {t.appTitle}
          </Typography>
          <div className={classes.grow} />
          <FormControl className={classes.languageForm}>
            <InputLabel id="language-select-label" className={classes.languageLabel}>
              <TranslateIcon className={classes.languageIcon} fontSize="small" />
              {t.language}
            </InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              onChange={handleLanguageChange}
              className={classes.languageSelect}
            >
              {Object.keys(translationMap).map(langCode => (
                <MenuItem key={langCode} value={langCode}>
                  {getLanguageName(langCode)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} className={classes.mainContainer} disableGutters={true}>
        <Grid
          className={classes.gridContainer}
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <Card className={`${classes.imageCard} ${!image ? classes.imageCardEmpty : ''}`}>
              {image && preview && (
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={preview}
                    component="img"
                    title="Plant Leaf Image"
                  />
                </CardActionArea>
              )}
              {!image && (
                <CardContent>
                  <Box className={classes.tabRoot}>
                    <Tabs 
                      value={tabValue} 
                      onChange={handleTabChange}
                      indicatorColor="primary"
                      classes={{ indicator: classes.tabIndicator }}
                      centered
                    >
                      <Tab icon={<PhotoLibraryIcon />} label={t.uploadImage || "Upload"} />
                      <Tab icon={<CameraAltIcon />} label={t.useCamera || "Camera"} />
                    </Tabs>
                  </Box>
                  
                  {tabValue === 0 && (
                    <div {...getRootProps()} className={classes.dropzoneContainer}>
                      <input {...getInputProps()} />
                      <Typography variant="body1">
                        {t.dropzoneText}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t.supportedPlants}
                      </Typography>
                    </div>
                  )}
                  
                  {tabValue === 1 && (
                    <WebcamCapture 
                      onCapture={handleCameraCapture}
                      translations={cameraTranslations}
                    />
                  )}
                </CardContent>
              )}
              {data && (
                <CardContent className={classes.detail}>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t.label}</TableCell>
                          <TableCell align="right">{t.confidence}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{getTranslatedDiseaseName(data.class)}</TableCell>
                          <TableCell align="right" className={getConfidenceColor(confidence)}>
                            <strong>{confidence}%</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="h6" className={classes.detailsHeader}>
                    {t.detailedInfo}
                  </Typography>

                  <div className={classes.detailSection}>
                    <Typography variant="body1"><strong>{t.causes}:</strong></Typography>
                    <ol>
                      {data.cause.map((item, index) => (
                        <li key={index} className={classes.listItem}>{item}</li>
                      ))}
                    </ol>
                  </div>

                  <div className={classes.detailSection}>
                    <Typography variant="body1"><strong>{t.precautions}:</strong></Typography>
                    <ol>
                      {data.precaution.map((item, index) => (
                        <li key={index} className={classes.listItem}>{item}</li>
                      ))}
                    </ol>
                  </div>

                  <div className={classes.detailSection}>
                    <Typography variant="body1"><strong>{t.treatment}:</strong></Typography>
                    <ol>
                      {data.cure.map((item, index) => (
                        <li key={index} className={classes.listItem}>{item}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              )}

              {isLoading && (
                <CardContent className={classes.detail}>
                  <CircularProgress color="secondary" className={classes.loader} />
                  <Typography variant="h6" style={{ marginTop: "10px" }}>
                    {t.analyzing}
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
          {data && (
            <Grid item className={classes.buttonGrid}>
              <Button
                variant="contained"
                className={classes.clearButton}
                onClick={clearData}
                startIcon={<Clear fontSize="large" />}
              >
                {t.clearButton}
              </Button>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default ImageUpload;