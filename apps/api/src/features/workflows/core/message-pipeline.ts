// class MessagePipeline {
//     private middlewares = [];

//     use(fn) {
//         this.middlewares.push(fn)
//     }

//     async process(event) {
//         let i = 0
//         const next = async (err) => {
//             if (err || i >= this.middlewares.length) return
//             await this.middlewares[i++](event, next)
//         }
//         await next()
//     }
// }