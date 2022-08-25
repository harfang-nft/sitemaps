const axios = require('axios')
const { ethers } = require('ethers')
const fs = require('fs')
const config = require("./last.json");

const ELEMENT = `
  query{
    getLatest(
        page: 1
    ) {
      id
    }
  }
`

async function fetchUsers(startId) {
  const { data } = await axios({
    url: 'https://api.harfang.app/graphql',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data: {
      query: ELEMENT
    }
  })

  if(!!data.data.getLatest[0].id){
    const lastId = data.data.getLatest[0].id;
    for(let i = ethers.BigNumber.from(config.last_element_id).toNumber(); i < Number(lastId); i++){
      fs.appendFileSync('./sitemaps/cards.txt', `https://harfang.app/e/${i}\n`)
      fs.writeFileSync('./last.json', JSON.stringify({...config, last_element_id: ethers.utils.hexlify(i+1)}))
    }
  }
}

fetchUsers(ethers.BigNumber.from(config.last_element_id).toNumber())