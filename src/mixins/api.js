/*
* 取sessionId
* */

const getSessionId = (ss,callback) => {
    console.log(ss)
    wx.login({
        success: (res) => {
            wx.request({
                url: `${ss.$parent.globalData.h5url}/zzj/login.do`,
                data: {
                    code: res.code
                },
                header: {
                    'content-type': 'application/json',

                },
                success: (res) => {
                    if (res.data.code === 100) {
                        wx.setStorageSync("sessionId", res.data.sessionKey);
                        callback()
                    } else {
                        console.log('取不到sessionkey')
                    }
                },
            })
        },
        fail: (erro) => {
            wx.showToast({title: '微信登录失败', icon: 'none', duration: 2000})
        }
    })
}

/*
          * 判断后台登录状态
          * */
const checkuserStatus=(ss,callback) => {
    wx.request({
        url: `${ss.$parent.globalData.h5url}/zzj/checkuser.do`,
        data: {
            rawData: wx.getStorageSync("user").rawData,
            signature: wx.getStorageSync("user").signature
        },
        header: {
            'content-type': 'application/json', // 默认值
            'Cookie': 'JSESSIONID=' + wx.getStorageSync("sessionId")
        },
        success: (res) => {
            callback(res)
            // if(res.data.code === 102) {
            //
            // } else {
            //     console.log(res.data.code,99)
            // }
        },
    })
}

/*
          * 判断绑定状态
          * */
const getBind = (ss,callback) => {
    wx.request({
        url: `${ss.$parent.globalData.h5url}/wxzzj/checkBindUnionid.do`,
        data: {},
        header: {
            'content-type': 'application/json',
            'Cookie': 'JSESSIONID='+ wx.getStorageSync("sessionId")
        },
        success: (res) => {
            /*
             * 判断是否绑定手机号
            * */
            if(res.data.code==100){//已经绑定 登录
                callback(res)
            }else if(res.data.code==301){//未绑定
                wx.hideLoading()
                wx.navigateTo({
                    url: "bphone?bindId="+res.data.data.bindId
                });
            }else {//未保存用户
                console.log(1)
                let data = {
                    encryptedData: wx.getStorageSync("user").encryptedData,
                    iv:wx.getStorageSync("user").iv,
                    rawData: wx.getStorageSync("user").rawData
                };
                console.log(2)
                wx.request({
                    url: `${ss.$parent.globalData.h5url}/wxzzj/decryData.do`,
                    data: data,
                    header: {
                        'content-type': 'application/json',
                        'Cookie': 'JSESSIONID='+ wx.getStorageSync("sessionId")
                    },
                    success: (res) => {
                        if(res.data.code == 100) {
                            wx.hideLoading()
                            wx.navigateTo({
                                url: "bphone?bindId="+res.data.bindId
                            });
                        }else {
                            wx.hideLoading()
                            wx.showToast({
                                title: '账号异常',
                                icon: 'none'
                            });
                        }
                    }
                })
            }
            // else if (res.data.code == 102){
            //     wx.showToast({
            //         title: '账号异常',
            //         icon: 'none'
            //     })
            // }
        }
    })
}

const API = {
    getSessionId,
    checkuserStatus,
    getBind
}

export default {
    API
}