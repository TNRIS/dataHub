import {
  ADD_COLLECTION_TO_CART,
  REMOVE_COLLECTION_FROM_CART,
  EMPTY_CART,

  UPLOAD_ORDER_BEGIN,
  UPLOAD_ORDER_SUCCESS,
  UPLOAD_ORDER_FAILURE,

  SUBMIT_ORDER_BEGIN,
  SUBMIT_ORDER_SUCCESS,
  SUBMIT_ORDER_FAILURE
} from '../constants/orderCartActionTypes';

//  --- cart item management ---
export const addCollectionToCart = (collectionId, formInfo) => {
  addCollectionToLocalStorage(collectionId, formInfo);
  return (dispatch) => {
    dispatch({
      type: ADD_COLLECTION_TO_CART,
      payload: { collectionId, formInfo }
    })
  }
};

export const removeCollectionFromCart = (collectionId) => {
  removeCollectionFromLocalStorage(collectionId);
  return (dispatch) => {
    dispatch({
      type: REMOVE_COLLECTION_FROM_CART,
      payload: { collectionId }
    })
  }
};

export const emptyCart = () => {
  emptyStoredShoppingCart();
  return (dispatch) => {
    dispatch({
      type: EMPTY_CART
    })
  }
}

// --- local storage cart replication management ---

// get the shopping cart out of local storage and update component/store
// used on initial load
export const fetchStoredShoppingCart = () => {
  return dispatch => {
    if (typeof(Storage) !== void(0)) {
      const current = localStorage.getItem("data_shopping_cart") ? JSON.parse(localStorage.getItem("data_shopping_cart")) : null;
      // console.log(current);
      if (current) {
        return Object.keys(current).map((collectionId) => {
          const formInfo = current[collectionId];
          const today = Date.now();
          const diff = today - formInfo.cartDate;
          // if today is more than 14 days after the cartDate (date the dataset
          // was added to the shopping cart) then don't add it to the cart
          // as the uploads have expired in s3
          if (diff > 1209600000) {
            removeCollectionFromLocalStorage(collectionId);
            return true;
          }
          else {
            return dispatch({
              type: ADD_COLLECTION_TO_CART,
              payload: { collectionId, formInfo }
            });
          }
        });
      }
    }
    else {
      return true;
    }
  }
}

// clear out the shopping cart in local storage
export const emptyStoredShoppingCart = () => {
  if (typeof(Storage) !== void(0)) {
    if (localStorage.getItem("data_shopping_cart")) {
      localStorage.removeItem("data_shopping_cart");
    }
  }
}

export const addCollectionToLocalStorage = (collectionId, formInfo) => {
  if (typeof(Storage) !== void(0)) {
    const current = localStorage.getItem("data_shopping_cart") ? JSON.parse(localStorage.getItem("data_shopping_cart")) : {};
    const formObj = {};
    formObj[collectionId] = formInfo;
    const updated = {...current, ...formObj};
    localStorage.setItem("data_shopping_cart", JSON.stringify(updated));
  }
}

export const removeCollectionFromLocalStorage = (collectionId) => {
  if (typeof(Storage) !== void(0)) {
    const current = localStorage.getItem("data_shopping_cart") ? JSON.parse(localStorage.getItem("data_shopping_cart")) : null;
    if (current) {
      const { [collectionId]:value , ...removedOrders } = current;
      localStorage.setItem("data_shopping_cart", JSON.stringify(removedOrders));
    }

  }
}

// --- upload lifecycle actions ---
export const uploadOrderBegin = () => ({
  type: UPLOAD_ORDER_BEGIN
});

export const uploadOrderSuccess = () => ({
  type: UPLOAD_ORDER_SUCCESS
});

export const uploadOrderFailure = (error) => ({
  type: UPLOAD_ORDER_FAILURE,
  payload: { error }
});

// --- submit order cart lifecycle actions ---
export const submitOrderBegin = () => ({
  type: SUBMIT_ORDER_BEGIN
});

export const submitOrderSuccess = () => ({
  type: SUBMIT_ORDER_SUCCESS
});

export const submitOrderFailure = (error) => ({
  type: SUBMIT_ORDER_FAILURE,
  payload: { error }
});


// Shared Handle HTTP errors since fetch won't.
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

// --- upload order file actions ---

// shared function for getting permissions from the contact app to do the upload
// to s3. contact app lets the bucket know an upload is coming and returns
// a key which expires after a few minutes
async function getPolicy(policyUrl, key, dispatch) {
  const payload = {
    method: 'POST',
    body: JSON.stringify({key: key}),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const response = await fetch(policyUrl, payload);
    const res = await handleErrors(response);
    const json = res.json();
    return json;
  }
  catch (error) {
    return dispatch(uploadOrderFailure(error));
  }
}

export function uploadOrderFile(collectionId, cartInfo) {
  // if in development mode, use local api build for forms; otherwise, use prod deployed api
  const contactUrl = process.env.REACT_APP_API_URL + '/api/v1/contact/policy/';
  let policyUrl;
  // different policy permissions based on file type (zip vs image)
  if (cartInfo.type === 'AOI') {
    policyUrl = contactUrl + 'zip-upload';
  }
  else if (cartInfo.type === 'Screenshot') {
    policyUrl = contactUrl + 'image-upload';
  }
  return (dispatch, getState) => {
    dispatch(uploadOrderBegin());
    const cartFiles = Array.from(cartInfo.files);
    const fileDetails = {};
    // iterate all cart files since mulitple screenshot images permitted
    cartFiles.forEach((file, index) => {
      // create unique datetime'd key and retrieve policy permission
      const fileKey = 'data-tnris-org-order/' + collectionId + '_' + Date.now() + '_' + file.name.split(' ').join('_');
      getPolicy(policyUrl, fileKey, dispatch)
      .then((presignedUrl) => {
        // presigned url/policy created, so now...
        // build fake form to do the upload. required to use the s3 rest api
        let formData = new FormData();
        formData.append('key', presignedUrl.fields.key);
        formData.append('acl', 'private');
        formData.append('success_action_status', '201');
        formData.append('success_action_redirect', '');
        // if a zipfile upload, declare as application/zip as per contact-app policy requirement
        // otherwise, use the individual file type
        let contentType;
        if (cartInfo.type === 'AOI') {
          switch (file.type) {
            case 'application/zip':
              contentType = 'application/zip';
              break;
            case 'application/x-zip-compressed':
              contentType = 'application/zip';
              break;
            case 'application/x-zip':
              contentType = 'application/zip';
              break;
            default:
              contentType = file.type;
          }
        }
        else {
          contentType = file.type;
        }
        formData.append('Content-Type', contentType);
        formData.append('Content-Length', file.size);
        formData.append('Policy', presignedUrl.fields.policy);
        formData.append('x-amz-algorithm', presignedUrl.fields['x-amz-algorithm']);
        formData.append('x-amz-credential', presignedUrl.fields['x-amz-credential']);
        formData.append('x-amz-date', presignedUrl.fields['x-amz-date']);
        formData.append('x-amz-signature', presignedUrl.fields['x-amz-signature']);
        formData.append('file', file, file.name);

        const payload = {
          method: 'POST',
          body: formData
        };

        fileDetails[index] = {
          'filename': file.name,
          'link': "https://s3.amazonaws.com/contact-uploads/" + presignedUrl.fields.key
        };
        // do the upload
        fetch(presignedUrl.url, payload)
          .then(handleErrors)
          .then(res => {
            if (res.status === 201 && index === cartFiles.length - 1) {
              // if successful, remove the 'files' key from the form info
              // it is no longer needed since the upload was successful and
              // it just screws up the info saved in local storage
              const filesKey = 'files';
              const { [filesKey]:value , ...removedOrders } = cartInfo;
              const newCart = {
                ...removedOrders,
                attachments: fileDetails
              };
              // now that uploads are done, add to the store for components
              dispatch(addCollectionToCart(collectionId, newCart));
              dispatch(uploadOrderSuccess());
            }
            else if (res.status !== 201) {
              dispatch(uploadOrderFailure(res.statusText));
            }
          })
          .catch(error => dispatch(uploadOrderFailure(error)));
      })
      .catch(error => dispatch(uploadOrderFailure(error)));
    });
  };
}

// --- submit order form actions ---
export function submitOrderCartForm(formInfo) {
  // if in development mode, use local api build for forms; otherwise, use prod deployed api
  const contactUrl = process.env.REACT_APP_API_URL + '/api/v1/contact/submit/';
  return (dispatch, getState) => {
    dispatch(submitOrderBegin());
    const payload = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(formInfo)
    };
    fetch(contactUrl, payload)
    .then(handleErrors)
    .then(res => res.json())
    .then(json => {
      if (json.status === "success") {
        dispatch(emptyCart());
        dispatch(submitOrderSuccess());
      }
      else if (json.status === "error") {
        dispatch(submitOrderFailure(json.message));
      }
    })
    .catch(error => dispatch(submitOrderFailure(error)));
  };
}
