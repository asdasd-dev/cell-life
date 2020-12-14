import React, { useCallback, useEffect, useState } from 'react';
import './App.css';

function getNextState(previousArray: boolean[][]): boolean[][] {
  const rowsAmount = previousArray.length;
  const columnsAmount = previousArray[0].length;
  return previousArray.map((row, rowIndex) => {
    return row.map((cell, columnIndex) => {
      let aliveNeighbours = 0;
      // checking Moore neighbourhood and count alive neighbours
      for (let m = -1; m < 2; m++) {
        for (let k = -1; k < 2; k++) {
          if (m === 0 && k === 0) continue; // if checking 
          previousArray[mod(rowIndex + m, rowsAmount)][mod(columnIndex + k, columnsAmount)] 
          && aliveNeighbours++;
        }
      }
      return getCellNewState(cell, aliveNeighbours);
    })
  })
}

function mod(index: number, length: number) {
  if (index === length) {
    return 0;
  }
  for (; index < 0; index += length);
  return index;
}

function getCellNewState(cellValue: boolean, aliveNeighbours: number) {
  if (cellValue) {
    return aliveNeighbours === 3 || aliveNeighbours === 2 ? true : false
  }
  // cellValue = 0
  return aliveNeighbours === 3 ? true : false
}

function generateLife(rowsAmount: number, columnsAmount: number) {
  let initialArray: boolean[][] = [];
  for (let i = 0; i < rowsAmount; i++) {
    const binaryString = getRandomInt(2**columnsAmount).toString(2).padStart(columnsAmount, '0');
    initialArray.push(binaryString.split('').map( item => Boolean(Number(item)) ));
  }
  return initialArray;
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function App() {

  const [fieldSizeRows, setFieldSizeRows] = useState(50);
  const [fieldSizeColumns, setFieldSizeColumns] = useState(50);
  const [interval, setChangeInterval] = useState<NodeJS.Timeout | null>(null);
  const [cellArray, setCellArray] = useState(generateLife(fieldSizeRows, fieldSizeColumns))

  useEffect(() => {
    fieldSizeColumns < 1 ? setFieldSizeColumns(1) : fieldSizeColumns > 50 && setFieldSizeColumns(50);
    fieldSizeRows < 1 ? setFieldSizeRows(1) : fieldSizeRows > 100 && setFieldSizeRows(100);
  }, [fieldSizeColumns, fieldSizeRows])

  const removeInterval = useCallback(() => {
    if (interval) {
      clearInterval(interval);
      setChangeInterval(null);
    }
  }, [interval])

  const handleGameStatusChange = useCallback(() => {
    if (interval) {
      removeInterval();
    }
    else {
      setChangeInterval(setInterval(() => setCellArray(previousArray => getNextState(previousArray)), 1000))
    }
  }, [removeInterval, interval])

  const handleGenerateState = useCallback(() => {
    setCellArray(generateLife(fieldSizeRows, fieldSizeColumns));
    removeInterval();
  }, [fieldSizeRows, fieldSizeColumns, removeInterval])

  const handeFileUpload = useCallback((input: HTMLInputElement) => {
    if (!input.files)
      return;
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
      if (!reader.result) 
        return;
      const stringRows = reader.result.toString().split('\r\n');
      const initialArray = stringRows.map(row => 
           row.split('').map(strNumber => 
             Boolean(Number(strNumber))));
      removeInterval();
      setCellArray(initialArray);
      input.value = '';
    };
    reader.onerror = function() {
      console.log(reader.error);
    };
  }, [removeInterval])

  return (
    <div className="App">
      <table>
        <tbody>
          {cellArray.map((row, rowIndex) => 
              <tr key={'r' + rowIndex}>
                {row.map((cell, cellIndex) => 
                  <td key={'r' + rowIndex + 'c' + cellIndex} className={cell ? 'alive' : 'dead'}>{cell}</td>
                )}
              </tr>
          )}
        </tbody>
      </table>
      <div className='menu'>
        <div>
          <label htmlFor='rows'>Set rows amount</label>
          <input id="rows" type='number' min='5' max='50' 
            value={fieldSizeRows} 
            placeholder='Field size (n*n)' 
            onChange={e => setFieldSizeRows(Number(e.target.value))}/>
        </div>
        <div>
          <label htmlFor='columns'>Set columns amount</label>
          <input id="columns" type='number' min='5' max='50' 
            value={fieldSizeColumns} 
            placeholder='Field size (n*n)' 
            onChange={e => setFieldSizeColumns(Number(e.target.value))}/>
        </div>
        <button onClick={handleGenerateState} className="generator">
          Generate life
        </button>
        <div>
          <label className='file-label'>
              <input type="file" onChange={e => handeFileUpload(e.currentTarget)}/>
              Generate life from file
          </label>
        </div>
        <button onClick={handleGameStatusChange} className="game-status">
          {interval ? 'Stop game' : 'Start game'}
        </button>
      </div>
    </div>
  );
}

export default App;
