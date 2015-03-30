define(function(require)
{
    require('fabric');
    var $ = require('jquery');
    require('app/history-queue');
    var objectHistory = new QueueFactory.HistoryQueue();
    var canvas = new fabric.Canvas('mainCanvas',
    {
        isDrawingMode: true
    });
    if (canvas)
    {
        //console.log('Canvas loaded');
        //console.log(canvas);
    }
    var drawingColour = 'rgba(0, 0, 0, 1)';
    var drawingOpacity = 1;
    var drawingFillModeOn = false;
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas()
    {
        canvas.setHeight(500);
        canvas.setWidth(window.innerWidth);
        canvas.calcOffset();
        canvas.renderAll();
    }
    // MAIN
    resizeCanvas();
    // Render test
    var rect = new fabric.Rect(
    {
        fill: 'red',
        width: 50,
        height: 50,
        angle: 45
    });
    canvas.add(rect);
    rect.set(
    {
        left: window.innerWidth / 2,
        top: 50
    });
    canvas.renderAll();
    $('#brushSizeButtons button').click(function()
    {
        $('.brushSizeOptions button').addClass('active').not(this).removeClass('active');
        var brushSize = parseInt($(this).val());
        // How much brush sizes should vary
        var brushSizeMultiplier = 5;
        //console.log(brushSize);
        if (canvas.freeDrawingBrush)
        {
            canvas.freeDrawingBrush.width = brushSize * brushSizeMultiplier || 1;
        }
    });
    // Simulate click to initialize brush size
    $('#brushSizeButtons button:nth(1)').click();
    $('#btnClearCanvas').click(function()
    {
        canvas.clear();
    });
    $('#colourPicker').on('change', function()
    {
        canvas.freeDrawingBrush.color = this.value;
    });
    renderColourPalette();

    function renderColourPalette()
    {
        var colours = ['C7FF0C', '91F432', '4DE55D', '08D689', '0CBFB3',
            //2nd row
            '02779E', '63D3FF', 'BE80FF', '9061C2', 'FF548F',
            //3rd row
            'FF003C', 'FF8A00', 'FABE28', '88C100', '00C176',
            //4th row
            'FFFFFF', 'E4E4E4', 'ACACAC', '565656', '000000'
        ];
        var coloursAdded = 0;
        colours.forEach(function(colour)
        {
            var colourButton = document.createElement('input');
            colourButton.type = 'button';
            colourButton.className = 'btn btnPickColour noGlow';
            colourButton.style.backgroundColor = '#' + colour;
            $('#colourPaletteButtons').append(colourButton);
            if (coloursAdded % 5 === 4)
            {
                $('#colourPaletteButtons').append('<br>');
            }
            coloursAdded++;
        });
        $('.btnPickColour').click(function()
        {
            $('.btnPickColour').addClass('active').not(this).removeClass('active').css(
            {
                'box-shadow': 'initial'
            });
            var selectedColour = $(this).css('background-color');
            //canvas.freeDrawingBrush.color = selectedColour;
            setDrawingColour(selectedColour);
            $(this).css(
            {
                'box-shadow': 'inset 0px 0px 0px 1px ' + invertRGB(selectedColour)
            });
        });
        $('.btnPickColour:first').addClass('active').click();

        function invertRGB(rgba)
        {
            rgb = [].slice.call(arguments).join(",").replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
            for (var i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
            return 'rgb(' + rgb.join(", ") + ')';
        }
        $('#brushOpacityToggle button').click(function()
        {
            $('#brushOpacityToggle button').addClass('active').not(this).removeClass('active');
            var brushOpacity = parseInt($(this).val());
            var currentColor = canvas.freeDrawingBrush.color;
            var opacity = parseFloat($(this).val());
            //var newColor = changeRGBOpacity(currentColor, opacity);
            //canvas.freeDrawingBrush.color = newColor;
            //console.log(newColor);
            setDrawingOpacity(opacity);
        });
        canvas.on('object:added', function(object)
        {
            if(typeof object.target.addedByRedo === 'undefined')
            {
                objectHistory.add(object.target);
                console.log(objectHistory.toString());
            }
        });
        canvas.on('path:created', function(pathContainer)
        {
            if (drawingFillModeOn === true)
            {
                pathContainer.path.fill = drawingColour;
                canvas.renderAll();
                //console.log('filled!');
            }
        });
        canvas.on('mouse:down', function()
        {
            //Refresh colour in case a new one got selected
            //var updatedColour = changeRGBOpacity(drawingColour, drawingOpacity);
            //canvas.freeDrawingBrush.color = updatedColour;
        });
        $('#brushFillModeToggle button').click(function()
        {
            $('#brushFillModeToggle button').addClass('active').not(this).removeClass('active');
            var fillModeOn = $(this).val();
            drawingFillModeOn = fillModeOn === 'true' ? true : false;
            //console.log(drawingFillModeOn);
        });
        $('#btnUndo').click(function()
        {
            var currentItem = objectHistory.getCurrent();

            if (currentItem !== null)
            {
                //canvas.remove(previousItem);
                canvas.remove(currentItem);
                objectHistory.undo();
            }
            else
            {
                console.log('previousItem was null');
            }
            console.log(objectHistory.toString());
        });
        $('#btnRedo').click(function()
        {
            var nextItem = objectHistory.redo();
            console.log(objectHistory.toString());
            if (nextItem !== null)
            {
                nextItem.addedByRedo = true;
                canvas.add(nextItem);
            }
            else
            {
                console.log('nextItem was null');
            }
        });

        function changeRGBOpacity(rgb, opacity)
        {
            var rgba;
            // Don't convert rgba, just change opacity
            if (rgb.indexOf('rgba') !== -1)
            {
                rgba = rgb;
                var lastCommaPosition = rgba.search(/\,(?!.*\,)/);
                rgba = rgba.slice(0, lastCommaPosition + 1);
                rgba += ' ' + opacity + ')';
            }
            else
            {
                rgba = rgb.replace('rgb(', 'rgba(');
                rgba = rgba.replace(')', ', ' + opacity + ')');
            }
            return rgba;
        }

        function setDrawingColour(RGBColour)
        {
            drawingColour = changeRGBOpacity(RGBColour, drawingOpacity);
            updateBrush();
        }

        function setDrawingOpacity(opacity)
        {
            drawingOpacity = opacity;
            drawingColour = changeRGBOpacity(drawingColour, opacity);
            updateBrush();
        }

        function updateBrush()
        {
            canvas.freeDrawingBrush.color = drawingColour;
            //console.log(drawingColour);
        }
    }
});