
function DisplayError(snackbar, message) {
  const { enqueueSnackbar } = snackbar;
  enqueueSnackbar(message, {variant: 'error'})
}

export { DisplayError }
