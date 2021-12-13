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
        alginItems: "center",
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
    help: {
        color: "#302f2f"
    },
    textfield: {
        textAlign: 'center',
        width: "200px",
    },
    dropdown: {
        width: "200px",
    },
    gridList: {
        height: 650,
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
    confirmationContainer: {
        // display: "flex",
        flex: "center",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#a19d9d",
        borderRadius: "25px",
        textAlign: "center",
        padding: "20px",
        width: "300px"
    }
});

export default styles;