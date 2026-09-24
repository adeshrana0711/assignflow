import { Link } from "react-router-dom";
import { date, statusLabel } from "./studentApi.js";

export default function AssignmentTable({
  assignments = [],
}) {

  if (!assignments.length) {

    return (
      <p className="empty-state-card">
        No assignments found.
      </p>
    );
  }


  return (
    <div className="table-card">

      <table>

        <thead>

          <tr>

            <th>
              Title
            </th>

            <th>
              Category
            </th>

            <th>
              Professor
            </th>

            <th>
              Due Date
            </th>

            <th>
              Status
            </th>

            <th>
              Action
            </th>

          </tr>

        </thead>


        <tbody>

          {assignments.map((item) => {

            const professor =
              item.professorId ||
              item.reviewerId ||
              {};


            return (
              <tr key={item._id}>

                <td>
                  <strong>
                    {item.title ||
                      "Untitled Assignment"}
                  </strong>
                </td>


                <td>
                  {item.category ||
                    "Assignment"}
                </td>


                <td>
                  {professor.name ||
                    "Not assigned"}
                </td>


                <td>
                  {date(item.dueDate)}
                </td>


                <td>

                  <span
                    className={`student-status ${
                      item.status ||
                      "unknown"
                    }`}
                  >
                    {statusLabel(
                      item.status
                    )}
                  </span>

                </td>


                <td>

                  <Link
                    className="student-action"
                    to={`/student/assignments/${item._id}`}
                  >
                    View
                  </Link>

                </td>

              </tr>
            );

          })}

        </tbody>

      </table>

    </div>
  );
}


