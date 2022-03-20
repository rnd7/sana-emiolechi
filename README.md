# Photography
Sana Emiolechi - Photography

[https://rnd7.github.io/sana-emiolechi/](https://rnd7.github.io/sana-emiolechi/)


## The App
The App I wrote to view my precious images is free to use an open soure. You might use it for your own photography. And host it on any platform that supports static websites. I chose this one. Nevetheless you'll probably have to be some kind of nerd, since you need to use the commandline to update your image gallery.

## Prerequesites
You need Node.js installed on your local machine. I also assume that yarn is installed.

## Clone Repo
For now you need to clone this repo, including my images. I'll change this some time.

## Install Locally
Clone repo and run.
```
yarn install
```

## Generate the static website
Images inside the assets folder are scanned and hashed. If not already existing thumbnails and full size images for the web are generated. If an image is located in a subfolder the subfolder name is used as tag to filter the images within the application. This applies also for multiple nested folders.

Within your repo directory.
```
node generate.js
```

Run local test server.
```
yarn http-serve
```

## License
All photography under CC BY-NC-ND 4.0 License by Sana Emiolechi. 
[https://creativecommons.org/licenses/by-nc-nd/4.0/](https://creativecommons.org/licenses/by-nc-nd/4.0/)


The Source Code is freely available under the MIT License.