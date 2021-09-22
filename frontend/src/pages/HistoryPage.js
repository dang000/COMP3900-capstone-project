import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTable } from 'react-table';
import Header from '../components/Header';
import Button from '../components/Button';
import { getAllCourseInfo } from '../utils/courseHandles';

const HistoryDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Styles = styled.div`
  table {
    width: 100%;
    border-spacing: 0;
    border: 1px solid black;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 1rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
  }
`;

/**
 * Given a filetype, and a course id
 * download that course id as a given filetype
 * @param filetype
 * @param courseId
 * @returns {Promise<void>}
 */
const download = async (filetype, courseId) => {
  const result = await fetch(`/download/${filetype}/${courseId}`);
  if (result.status === 200) {
    const reader = result.body.getReader();
    reader.read().then(({ value }) => {
      const type = `application/${filetype}`;
      const blob = new Blob([new TextDecoder('utf-8').decode(value)], { type });
      const url = URL.createObjectURL(blob);
      // create temporary element
      const doc = document.createElement('a');
      doc.href = url;
      doc.download = `Course_Entry.${filetype}`;
      doc.click();
    });
  }
};

function Table({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  // Render Data Table UI
  return (
    // apply the table props
    <table {...getTableProps()}>
      <thead>
        {
          // Loop over the header rows
          headerGroups.map((headerGroup) => (
          // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              {
              // Loop over the headers in each row
              headerGroup.headers.map((column) => (
                // Apply the header cell props
                <th {...column.getHeaderProps()}>
                  {
                    // Render the header
                    column.render('Header')
                  }
                </th>
              ))
              }
            </tr>
          ))
        }
      </thead>
      {/* Apply the table body props */}
      <tbody {...getTableBodyProps()}>
        {
        // Loop over the table rows
        rows.map((row) => {
          // Prepare the row for display
          prepareRow(row);
          return (
            // Apply the row props
            <tr {...row.getRowProps()}>
              {
                // Loop over the rows cells
                row.cells.map((cell) => (
                  // Apply the cell props
                  <td
                    {...cell.getCellProps()}
                    style={{
                      verticalAlign: 'top',
                      textAlign: 'left',
                    }}
                  >
                    {
                      // Render the cell contents
                      cell.render('Cell')
                    }
                  </td>
                ))
              }
            </tr>
          );
        })
        }
      </tbody>
    </table>
  );
}

const List = ({ values }) => (
  <ul>
    {' '}
    {values.map((item) => (<li>{item}</li>))}
  </ul>
);

const HistoryPage = () => {
  const [course, setCourse] = useState([]);
  const columns = React.useMemo(
    () => [
      {
        Header: 'Title',
        accessor: 'title',
      }, {
        Header: 'Discipline',
        accessor: 'discipline',
      }, {
        Header: 'Code',
        accessor: 'code',
      }, {
        Header: 'Faculty',
        accessor: 'faculty',
      }, {
        Header: 'Description',
        accessor: 'description',
      }, {
        Header: 'Course Learning Outcomes',
        accessor: 'clos',
        Cell: ({ cell: { value } }) => <List values={value} />,
      }, {
        Header: 'Assessments',
        accessor: 'assessments',
        Cell: ({ cell: { value } }) => <List values={value} />,
      }, {
        Header: 'Export',
        Cell: ({ cell }) => {
          console.log(cell.row.index);
          return (
            <>
              <Button
                title="EXPORT AS PDF"
                width="250px"
                height="60px"
                fontSize="24px"
                onClick={() => {
                  download('pdf', cell.row.index);
                }}
              />
              <Button
                marginTop="10px"
                title="EXPORT AS JSON"
                width="250px"
                height="60px"
                fontSize="24px"
                onClick={() => {
                  download('json', cell.row.index);
                }}
              />
            </>
          );
        },
      },
    ], [],
  );

  useEffect(async () => {
    const result = await getAllCourseInfo();
    const resultJSON = await result.json();
    const { courses } = resultJSON;
    for (let i = 0; i < courses.length; ++i) {
      const course = JSON.parse(courses[i]);
      course.clos = course.clos.map((clo) => (`${clo.text}`));
      course.assessments = course.assessments.map((assessment) => (`${assessment.text} (${assessment.weight})`));
      courses[i] = course;
    }
    setCourse(courses);
  }, []);

  return (
    <HistoryDiv>
      <Header title="History" />
      <Styles>
        <Table
          data={course}
          columns={columns}
        />
      </Styles>
      <Link to="/home">
        <Button title="BACK" width="250px" height="60px" fontSize="24px" />
      </Link>
    </HistoryDiv>
  );
};

export default HistoryPage;
