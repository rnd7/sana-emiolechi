import {globby} from 'globby';
import {resize} from "easyimage";
import * as path from 'path'
import fs from 'fs-extra'
import imghash, { hash } from 'imghash';
import ColorThief from 'colorthief'
import quantize from 'quantize'
import exifr from 'exifr'


(async () => {
    let data = {list: [], tags: {}, paths: {}}
    try {
        // await fs.emptyDir('generated')

        // search for names
        //const namesStr = await fs.readFile('assets/names', 'utf8');
        //data.names = namesStr.split(/\r\n?|\n/gi)
          

        const paths = await globby('assets', {
            expandDirectories: {
                extensions: ['jpg', 'png']
            }
        });
        console.log(`Processing ${paths.length} Images`)
        for (let i = 0; i<paths.length; i++) {
            try {
                const p = paths[i]
                console.log(`Processing Image ${i+1}/${paths.length} ${p}.`)
                const filename = path.basename(p)
                const imageHash = await imghash.hash(p,12)
                const imageMeta = await exifr.parse(p, {
                    tiff: true,
                    xmp: true,
                    icc: true,
                    iptc: true,
                    jfif: true,
                    ihdr: true,
                    interop: true,
                    makerNote: true,
                    userComment: true
                })
                const dominantColor = await ColorThief.getColor(p)

                const name = filename.replace('_',' ').replace(/\.[^\.]*$/gi, '')
                const pathArray = path.dirname(p).split(path.sep)
                pathArray.shift() // remove root dir
                const pathString = pathArray.join("/")
                if(!data.paths.hasOwnProperty(pathString)) data.paths[pathString] = {colors:[]}
                data.paths[pathString].colors.push(dominantColor)

                let tags = []
                if (imageMeta.subject) {
                    if (Array.isArray(imageMeta.subject)) {
                        tags = imageMeta.subject
                    } else {
                        tags = [imageMeta.subject]
                    }
                }
                
                tags.forEach((tag)=>{
                    if(!data.tags.hasOwnProperty(tag)) data.tags[tag] = {colors:[]}
                    data.tags[tag].colors.push(dominantColor)
                })
                const meta = {
                    thumbnail: path.join('generated',`${imageHash}-thumb.jpg`),
                    src: path.join('generated',`${imageHash}.jpg`),
                    name,
                    filename,
                    hash: imageHash,
                    dominantColor: {
                        r: dominantColor[0],
                        g: dominantColor[1],
                        b: dominantColor[2],
                    },
                    path: pathString,
                    date: imageMeta.DateTimeOriginal || imageMeta.CreateDate,
                    rating: (imageMeta.Rating * 20) || imageMeta.RatingPercent || 0,
                    tags: Array.from(new Set(tags))
                }
                console.log(meta)
                const thumbExists = await fs.pathExists(meta.thumbnail)
                if(!thumbExists) {
                    await resize({
                        src: p,
                        dst: meta.thumbnail,
                        width: '500',
                        height: '500',
                    })
                } else {
                    console.log("Thumbnail exists, skipping.")
                }
              
                const imgExists = await fs.pathExists(meta.src)
                if (!imgExists) {
                    await resize({
                        src: p,
                        dst: meta.src,
                        width: '2048',
                        height: '2048',
                    }) 
                } else {
                    console.log("Image exists, skipping.")
                }

                data.list.push(meta)
                console.log("Done.")

            } catch (e) {
                console.error("Error processing image.", e)
            }
        }
        console.log("Average tag colors")
        Object.keys(data.tags).forEach((tag) => {
            const col = quantize(data.tags[tag].colors, 5).palette()[0]
            console.log(tag, col)
            data.tags[tag].dominantColor = {r: col[0], g: col[1], b: col[2]}
            data.tags[tag].count = data.tags[tag].colors.length
            delete data.tags[tag].colors
        })
        console.log("Average path colors")
        Object.keys(data.paths).forEach((pathString) => {
            const col = quantize(data.paths[pathString].colors, 5).palette()[0]
            console.log(pathString, col)
            data.paths[pathString].dominantColor = {r: col[0], g: col[1], b: col[2]}
            data.paths[pathString].count = data.paths[pathString].colors.length
            delete data.paths[pathString].colors
        })
        await fs.writeFile(
            path.join('generated', 'data.json'), 
            JSON.stringify(data)
        )
    } catch (e) {
        console.log("Error: ", e);
    }

	//=> ['cat.png', 'unicorn.png', 'cow.jpg', 'rainbow.jpg']
})();

