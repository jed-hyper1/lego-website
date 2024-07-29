const APIController = (function() {
    
    const clientId = '280967a123f343579600737dfb6d4022';
    const clientSecret = '8be4de73e11441858fec68637fae84f3';

    // private methods
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        console.log('Token:', data.access_token); // Print token
        return data.access_token;
    }
    
    const _getGenres = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        console.log('Genres:', data.categories.items); // Print genres
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {
        const limit = 10;
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        console.log('Playlists for genre:', data.playlists.items); // Print playlists
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {
        const limit = 10;
        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        console.log('Tracks:', data.items); // Print tracks
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {
        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        console.log('Track details:', data); // Print track details
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})();

const UIController = (function() {

    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list',
        buttonDownload: '#btn_download'
    }

    return {

        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail),
                download: document.querySelector(DOMElements.buttonDownload)
            }
        },

        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        }, 

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        createTrack(id, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        createTrackDetail(img, title, artist) {
            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            detailDiv.innerHTML = '';

            const html = 
            `
            <div class="row col-sm-12 px-0">
                <img src="${img}" alt="">        
            </div>
            <div class="row col-sm-12 px-0">
                <label for="Genre" class="form-label col-sm-12">${title}:</label>
            </div>
            <div class="row col-sm-12 px-0">
                <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
            </div> 
            `;

            detailDiv.insertAdjacentHTML('beforeend', html)
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        },

        // Create a button to download JSON file
        createDownloadButton() {
            const html = `<button id="btn_download" class="btn btn-secondary">Download JSON</button>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('afterend', html);
        },

        // Create and download the JSON file
        downloadJSON(data, filename = 'data.json') {
            const jsonFile = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(jsonFile);
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();
    let trackDetails = []; // Array to store track details

    const loadGenres = async () => {
        const token = await APICtrl.getToken();           
        UICtrl.storeToken(token);
        const genres = await APICtrl.getGenres(token);
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    DOMInputs.genre.addEventListener('change', async () => {
        UICtrl.resetPlaylist();
        const token = UICtrl.getStoredToken().token;        
        const genreSelect = UICtrl.inputField().genre;       
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);       
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
    });

    DOMInputs.submit.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.resetTracks();
        const token = UICtrl.getStoredToken().token;        
        const playlistSelect = UICtrl.inputField().playlist;
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name))
    });

    DOMInputs.tracks.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.resetTrackDetail();
        const token = UICtrl.getStoredToken().token;
        const trackEndpoint = e.target.id;
        const track = await APICtrl.getTrack(token, trackEndpoint);
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
        
        // Store track details in array
        trackDetails.push({
            img: track.album.images[2].url,
            title: track.name,
            artist: track.artists[0].name
        });

        // Check if download button already exists
        if (!document.querySelector('#btn_download')) {
            UICtrl.createDownloadButton();
        }
    });

    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id == 'btn_download') {
            UICtrl.downloadJSON(trackDetails);
        }
    });

    return {
        init() {
            console.log('App is starting');
            loadGenres();
        }
    }

})(UIController, APIController);

APPController.init();
