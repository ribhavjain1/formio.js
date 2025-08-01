/**
 *
 * @param {object} formio - formio instance
 * @returns {import('./typedefs').FileProvider} The FileProvider interface defined in index.js.
 */
function url(formio) {
  /**
   *
   * @param {object} options - options to set on the xhr
   * @param {object} xhr - the xhr object
   */
  function setOptions(options, xhr) {
    const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
    for (const prop in parsedOptions) {
      if (prop === 'headers') {
        const headers = parsedOptions['headers'];
        for (const header in headers) {
          xhr.setRequestHeader(header, headers[header]);
        }
      }
      else {
        xhr[prop] = parsedOptions[prop];
      }
    }
  }

  const xhrRequest = (url, name, query, data, options, progressCallback, abortCallback) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const json = (typeof data === 'string');
      const fd = new FormData();

      if (typeof progressCallback === 'function') {
        xhr.upload.onprogress = progressCallback;
      }

      if (typeof abortCallback === 'function') {
        abortCallback(() => xhr.abort());
      }

      if (!json) {
        for (const key in data) {
          fd.append(key, data[key]);
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Need to test if xhr.response is decoded or not.
          let respData = {};
          try {
            respData = (typeof xhr.response === 'string') ? JSON.parse(xhr.response) : {};
            respData = (respData && respData.data) ? respData.data : respData;
          }
          catch (err) {
            respData = {};
          }

          // Get the url of the file.
          let respUrl = respData.hasOwnProperty('url') ? respData.url : `${xhr.responseURL}/${name}`;

          // If they provide relative url, then prepend the url.
          if (respUrl && respUrl[0] === '/') {
            respUrl = `${url}${respUrl}`;
          }
          resolve({ url: respUrl, data: respData });
        }
        else {
          reject(xhr.response || 'Unable to upload file');
        }
      };

      xhr.onerror = () => reject(xhr);
      xhr.onabort = () => reject(xhr);

      let requestUrl = url + (url.indexOf('?') > -1 ? '&' : '?');
      for (const key in query) {
        requestUrl += `${key}=${query[key]}&`;
      }
      if (requestUrl[requestUrl.length - 1] === '&') {
        requestUrl = requestUrl.substr(0, requestUrl.length - 1);
      }

      xhr.open('POST', requestUrl);
      if (json) {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }
      const token = formio.getToken();
      if (token) {
        xhr.setRequestHeader('x-jwt-token', token);
      }

      //Overrides previous request props
      if (options) {
        setOptions(options, xhr);
      }
      xhr.send(json ? data : fd);
    });
  };

  return {
    title: 'Url',
    name: 'url',
    uploadFile(file, name, dir, progressCallback, url, options, fileKey, groupPermissions, groupId, abortCallback) {
      const uploadRequest = function(form) {
        return xhrRequest(url, name, {
          baseUrl: encodeURIComponent(formio.projectUrl),
          project: form ? form.project : '',
          form: form ? form._id : ''
        }, {
          [fileKey]:file,
          name,
          dir
        }, options, progressCallback, abortCallback).then(response => {
          // Store the project and form url along with the metadata.
          response.data = response.data || {};
          response.data.baseUrl = formio.projectUrl;
          response.data.project = form ? form.project : '';
          response.data.form = form ? form._id : '';
          return {
            storage: 'url',
            name,
            url: response.url,
            size: file.size,
            type: file.type,
            data: response.data
          };
        });
      };
      if (file.private && formio.formId) {
        return formio.loadForm().then((form) => uploadRequest(form));
      }
      else {
        return uploadRequest();
      }
    },
    deleteFile(fileInfo, options) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("DELETE", fileInfo.url, true);
        const token = formio.getToken();
        if (token) {
          xhr.setRequestHeader("x-jwt-token", token);
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve("File deleted");
          } else {
            reject(xhr.response || "Unable to delete file");
          }
        };
        if (options) {
          setOptions(options, xhr);
        }
        xhr.send(null);
      });
    },

    downloadFile(file) {
      if (file.private) {
        if (formio.submissionId && file.data) {
          file.data.submission = formio.submissionId;
        }
        return xhrRequest(file.url, file.name, {}, JSON.stringify(file)).then(response => response.data);
      }

      // Return the original as there is nothing to do.
      return Promise.resolve(file);
    }
  };
}

url.title = 'Url';
export default url;
