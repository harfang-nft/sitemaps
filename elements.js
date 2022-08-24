const axios = require('axios')
const { ethers } = require('ethers')
const fs = require('fs')
const config = require("./last.json");

const ELEMENT = `
    query($id: String!) {
        getGlobalElement(id: $id){
            imageCID
        }
    }
`

const end = 100000

async function fetchUsers(startId) {
  for (i = startId; i < end; i++) {
    const { data } = await axios({
      url: 'https://api.harfang.app/graphql',
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      data: {
        query: ELEMENT,
        variables: { id: `${i}` }
      }
    })


    const imageCID = data?.data?.getGlobalElement?.imageCID;
    const newConfig = config;
    newConfig.last_element_id = ethers.utils.hexlify(i);
    fs.writeFileSync('last.json', JSON.stringify(newConfig))

    if (!imageCID) {
      console.log(`Next ID starts from: ${i}`)
      return
    }

    console.log(
      `${i} => https://ipfs.harfang.app/ipfs/${imageCID}`
    )
    fs.appendFileSync(
      'sitemaps/images.txt',
      `https://ipfs.harfang.app/ipfs/${imageCID}\n`
    )
    fs.appendFileSync(
        'sitemaps/cards.txt',
        `https://harfang.app/e/${i}\n`
    )
  }
}

fetchUsers(ethers.BigNumber.from(config.last_element_id).toNumber())