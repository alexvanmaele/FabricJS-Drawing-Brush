(function(exports)
{
    var queue;
    var currentPosition;

    function HistoryQueue()
    {
        // First element is always zero, representing an 'empty' history state
        queue = [null];
        currentPosition = 0;
    }
    HistoryQueue.prototype.add = function(item)
    {
        if (currentPosition + 1 < queue.length)
        {
            queue[currentPosition+1] = item;
            queue = queue.slice(0, currentPosition + 2);
            currentPosition++;
        }
        else
        {
            queue[++currentPosition] = item;
        }
    };
    HistoryQueue.prototype.undo = function()
    {
        if (currentPosition > 0)
        {
            currentPosition--;
        }
        return queue[currentPosition];
    };
    HistoryQueue.prototype.redo = function()
    {
        if (currentPosition + 1 < queue.length)
        {
            currentPosition++;
            return queue[currentPosition];
        }
        else
        {
            return null;
        }
    };
    HistoryQueue.prototype.getCurrent = function()
    {
        return queue[currentPosition];
    };
    HistoryQueue.prototype.getCurrentPosition = function()
    {
        return currentPosition;
    };
    HistoryQueue.prototype.toString = function()
    {
        var queueString = '[';
        // Skip first element because it will always be null
        for (var i = 0; i < queue.length; i++)
        {
            if (i === 0)
            {
                queueString += 'X';
            }
            else
            {
                queueString += 'O';
            }
            if (i === currentPosition)
            {
                queueString += '*';
            }
            queueString += '|';
        }
        // Get rid of last | delimiter
        queueString = queueString.slice(0, -1);
        queueString += ']';
        queueString += '\nCurrent position: ' + currentPosition;
        queueString += '\nTotal length: ' + queue.length;
        return queueString;
    };
    exports.HistoryQueue = HistoryQueue;
})(typeof exports === 'undefined' ? this.QueueFactory = {} : exports);