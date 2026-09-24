import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, dateTime } from "./studentApi.js";

export function StudentNotifications() {

  const [notifications, setNotifications] =
    useState([]);


  const [error, setError] =
    useState("");


  const [loading, setLoading] =
    useState(true);


  // ------------------------------------------------------
  // LOAD NOTIFICATIONS
  // ------------------------------------------------------

  const reload = async () => {

    try {

      setLoading(true);
      setError("");


      const data =
        await api(
          "/api/student/notifications"
        );


      setNotifications(
        Array.isArray(
          data.notifications
        )
          ? data.notifications
          : []
      );

    } catch (error) {

      setError(
        error.message ||
          "Unable to load notifications."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    reload();

  }, []);


  // ------------------------------------------------------
  // MARK ONE READ
  // ------------------------------------------------------

  const mark = async (id) => {

    try {

      await api(
        `/api/student/notifications/${id}/mark-read`,
        {
          method: "POST",
        }
      );

      await reload();

    } catch (error) {

      setError(
        error.message ||
          "Unable to mark notification."
      );

    }

  };


  // ------------------------------------------------------
  // MARK ALL READ
  // ------------------------------------------------------

  const markAll = async () => {

    try {

      await api(
        "/api/student/notifications/mark-all-read",
        {
          method: "POST",
        }
      );

      await reload();

    } catch (error) {

      setError(
        error.message ||
          "Unable to mark notifications."
      );

    }

  };


  return (
    <>

      {/* HEADER */}

      <section className="student-heading">

        <div>

          <h1>
            Notifications
          </h1>

          <p>
            Updates about your assignments
            and professor reviews.
          </p>

        </div>


        {notifications.some(
          (notification) =>
            !notification.read
        ) && (

          <button
            className="primary-button"
            onClick={markAll}
          >
            Mark All as Read
          </button>

        )}

      </section>


      {/* ERROR */}

      {error && (

        <p className="api-error">
          {error}
        </p>

      )}


      {/* LOADING */}

      {loading ? (

        <div className="student-loading-card">

          <div className="student-spinner"></div>

          <p>
            Loading notifications...
          </p>

        </div>

      ) : (

        <div className="notification-list">

          {notifications.length ? (

            notifications.map(
              (notification) => {

                const assignment =
                  notification.assignmentId;


                return (
                  <article
                    key={
                      notification._id
                    }
                    className={
                      !notification.read
                        ? "unread"
                        : ""
                    }
                  >

                    <div>

                      <strong>
                        {notification.message}
                      </strong>

                      <p>

                        {dateTime(
                          notification.createdAt
                        )}

                        {assignment &&
                          ` · ${assignment.title}`}

                      </p>

                    </div>


                    <div>

                      {assignment && (

                        <Link
                          className="student-action"
                          to={`/student/assignments/${assignment._id}`}
                        >
                          View
                        </Link>

                      )}


                      {!notification.read && (

                        <button
                          type="button"
                          onClick={() =>
                            mark(
                              notification._id
                            )
                          }
                        >
                          Mark Read
                        </button>

                      )}

                    </div>

                  </article>
                );

              }
            )

          ) : (

            <p className="empty-state-card">
              No notifications yet.
            </p>

          )}

        </div>

      )}

    </>
  );
}