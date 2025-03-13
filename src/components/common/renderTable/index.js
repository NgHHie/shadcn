import React from 'react';
import './style.scss'
import { isValid } from '../../../utils/Util';
export const renderTable = (data) => {
    if (!isValid(data) || data.length === 0) {
        return "No data can be found!"
    }
    if (!data || !Array.isArray(data) || data.length === 0) {
        return data?.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    }

    const headersSet = new Set();
    data.forEach(row => {
        Object.keys(row).forEach(key => headersSet.add(key));
    });
    const headers = Array.from(headersSet);


    return (
        <div className="result-execute-sql-container">
            <table>
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {headers.map((header, headerIndex) => (
                                <td key={headerIndex}>
                                    {row[header] !== undefined ? row[header] : 'N/A'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};