window.onload = async() => {
  const maskimage= 48
  const nomaskimage=48

  const imagestrained= document.querySelector(".train-images")
  const video = document.getElementById("test-img")
  
  function startVideo()
  {
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
      )
  }
startVideo()

  for(let i=1; i<= maskimage;i++)
  {
    const newImage = document.createElement('IMG');
    newImage.setAttribute(`src`, `images/mask/1 (${i}).jpg`)
    newImage.classList.add('mask-img')
    imagestrained.appendChild(newImage)
  }
  for(let i=1; i<= nomaskimage;i++)
  {
    const newImage = document.createElement('IMG');
    newImage.setAttribute(`src`, `images/no-mask/2 (${i}).jpg`)
    newImage.classList.add('no-mask-img')
    imagestrained.appendChild(newImage)
  }

  const mobilenetTest = await mobilenet.load({version: 2, alpha: 1})
   const classifer= await trainModel(mobilenetTest)
   console.log(classifer)

   const testImage = document.getElementById('test-img')
   const tfTestImage = tf.browser.fromPixels(testImage)
   const logits = mobilenetTest.infer(tfTestImage, 'conv_preds')
   const prediction = await classifer.predictClass(logits);
   console.log(prediction)

   if(prediction.label == 0){
     testImage.classList.add('mask')
   }else{
     testImage.classList.add('no-mask')
   }
}

async function trainModel(mobilenetTest) {
   const knnclassifer = knnClassifier.create()


    const maskImages = document.querySelectorAll('.mask-img')
    maskImages.forEach(img => {
      const tfImg = tf.browser.fromPixels(img)
      const logits = mobilenetTest.infer(tfImg, 'conv_preds');
      knnclassifer.addExample(logits, 0) //is wearing a mask
    })

    const noMaskImages = document.querySelectorAll('.no-mask-img')
    noMaskImages.forEach(img => {
      const tfImg = tf.browser.fromPixels(img)
      const logits = mobilenetTest.infer(tfImg, 'conv_preds');
      knnclassifer.addExample(logits, 1) //is not wearing a mask
    })
    return knnclassifer
}