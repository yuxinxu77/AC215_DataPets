/* eslint-disable */
const styles = theme => ({
    root: {
        flexGrow: 1,
        minHeight: "100vh"
    },
    grow: {
        flexGrow: 1,
    },
    main: {

    },
    container: {
        backgroundColor: "#ffffff",
        paddingTop: "30px",
        paddingBottom: "20px",
    },
    greenButton: {
        backgroundColor: '#08815f',
        color:"white",
    },
    dropzone: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 10px 10px",
        margin: "60px",
        borderWidth: "2px",
        borderRadius: "2px",
        borderColor: "#cccccc",
        borderStyle: "dashed",
        backgroundColor: "#fafafa",
        outline: "none",
        transition: "border .24s ease-in-out",
        cursor: "pointer",
        backgroundImage: "url('https://storage.googleapis.com/dogs_img/dog_bcgd.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "400px",
    },
    fileInput: {
        display: "none",
    },
    preview: {
        height: "400px",
        backgroundPosition: "center",
    },
    overlay: {
        position: 'absolute',
        top: '20px',
        left: '10px',
        right: '10px',
        textAlign: "center",
        color: "black",
        backgroundColor: "none",
        fontFamily: "Comic Sans MS"
    },
    previewgrid: {
        width: "200px",
        height: "200px",
    },
    help: {
        color: "#302f2f"
    },
    safe: {
        color: "#31a354",
    },
    gridList: {
        height: 300,
        width: 900,
    },
    thumbnailImage: {
        opacity: 0.80,
        '&:hover': {
            opacity: 1
        }
    },
    predictionImage: {
        height: 0,
        paddingTop: '100%',
        opacity: 0.7,
    },
    progressBar: {
        position: "absolute",
        top: "300px",
        left: "48%",
        color: "#ffffff"
    },
    media: {
        height: 0,
        paddingTop: '100%',
    },
    card: {
        margin: 5,
        // height: 250,
        // width: '23%',
    },
    paper: {
        padding: theme.spacing(2),
        //color: theme.palette.text.secondary,
        width: '100%',
    },
    formControl: {
        // margin: theme.spacing(3),
        marginLeft: 24,
        marginRight:24,
        minWidth: 100,
    },
});

export default styles;