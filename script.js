const canvas = document.getElementById('imageCanvas');
  const ctx = canvas.getContext('2d');
  const imageInput = document.getElementById('imageInput');
  const textInputs = [document.getElementById('text1'), document.getElementById('text2')];
  const downloadBtn = document.getElementById('downloadBtn');

  let img = new Image();
  let texts = [
    { text: '', x: 0, y: 0, isDragging: false },
    { text: '', x: 0, y: 0, isDragging: false }
  ];

  // Максимальные размеры для изображения
  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 600;
  const TOP_MARGIN = 50;
  const TEXT_HEIGHT = 60;
  const BOTTOM_MARGIN = 50 + TEXT_HEIGHT;

  // Загрузка и ограничение размера изображения
  imageInput.addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
      img = new Image();
      img.onload = function() {
        const { width, height } = resizeImage(img.width, img.height, MAX_WIDTH, MAX_HEIGHT);
        canvas.width = width;
        canvas.height = height;

        // Установка позиций текстов по центру по X и верх/низ по Y
        texts[0].x = width / 2;
        texts[0].y = TOP_MARGIN;
        texts[1].x = width / 2;
        texts[1].y = height - BOTTOM_MARGIN;

        drawCanvas();
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  }, false);

  function resizeImage(width, height, maxWidth, maxHeight) {
    let ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    return {
      width: width * ratio,
      height: height * ratio
    };
  }

  textInputs.forEach((input, index) => {
    input.addEventListener('input', function() {
      texts[index].text = this.value;
      drawCanvas();
    });
  });

  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (img.src) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    texts.forEach(textObj => {
      if (textObj.text) {
        ctx.font = TEXT_HEIGHT + "px Impact";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.textAlign = "center"; // Центрирование по X
        ctx.textBaseline = "top"; // Выравнивание по Y
        ctx.fillText(textObj.text, textObj.x, textObj.y);
        ctx.strokeText(textObj.text, textObj.x, textObj.y);
      }
    });
  }

  let selectedText = null;
  let offsetX, offsetY;

  canvas.addEventListener('mousedown', function(e) {
    const mousePos = getMousePos(canvas, e);
    texts.forEach((textObj, index) => {
      if (!textObj.text) return;

      const textWidth = ctx.measureText(textObj.text).width;

      // Поскольку textAlign = "center", x позиция — центр текста
      const textLeft = textObj.x - textWidth / 2;
      const textRight = textObj.x + textWidth / 2;
      const textTop = textObj.y;
      const textBottom = textObj.y + TEXT_HEIGHT;

      if (mousePos.x >= textLeft && mousePos.x <= textRight &&
        mousePos.y >= textTop && mousePos.y <= textBottom) {
        selectedText = textObj;
        offsetX = mousePos.x - textObj.x;
        offsetY = mousePos.y - textObj.y;
      }
    });
  });

  canvas.addEventListener('mousemove', function(e) {
    if (selectedText) {
      const mousePos = getMousePos(canvas, e);
      selectedText.x = mousePos.x - offsetX;
      selectedText.y = mousePos.y - offsetY;
      drawCanvas();
    }
  });
 
  canvas.addEventListener('mouseup', function() {
    selectedText = null;
  });

  canvas.addEventListener('mouseleave', function() {
    
    selectedText =  null;
     
  });

  function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) * (canvas.width / rect.width),
      y: (evt.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  // Скачивание изображения
  downloadBtn.addEventListener('click', function() {
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL();
    link.click();
  });

  // Инициализация с пустым холстом
  drawCanvas();