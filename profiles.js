const axios = require('axios')
const { ethers } = require('ethers')
const fs = require('fs')
const config = require("./last.json");

const PROFILE = `
  query Profile($request: SingleProfileQueryRequest!) {
    profile(request: $request) {
      handle
    }
  }
`

const end = 100000

async function fetchUsers(startId) {
  for (i = startId; i < end; i++) {
    const { data } = await axios({
      url: 'https://api-mumbai.lens.dev',
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      data: {
        operationName: 'Profile',
        query: PROFILE,
        variables: { request: { profileId: `${ethers.utils.hexlify(i)}` } }
      }
    })

    console.log(data)

    const handle = data?.data?.profile?.handle
    const newConfig = config;
    newConfig.last_user_id = ethers.utils.hexlify(i);
    fs.writeFileSync('last.json', JSON.stringify(newConfig))

    if (!handle) {
      console.log(`Next ID starts from: ${i}`)
      return
    }

    console.log(
      `${i} (${ethers.utils.hexlify(i)}) => https://harfang.app/u/${handle}`
    )
    fs.appendFileSync(
      'sitemaps/users.txt',
      `https://harfang.app/u/${handle}\n`
    )
  }
}

fetchUsers(ethers.BigNumber.from(config.last_user_id).toNumber())