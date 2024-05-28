import React from "react";
import "./FormComponent.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const FormComponent = ({ worker, onSubmit, onCancel }) => {
  const initialValues = {
    siteName: worker ? worker.siteName : "",
    dataAmpUrl: worker ? worker.dataAmpUrl : "",
    dataAmpCurrent: worker ? worker.dataAmpCurrent : "",
    dataAmpTitle: worker ? worker.dataAmpTitle : "",
    href: worker ? worker.href : "",
    interval: worker ? worker.interval : "",
  };

  const prefilledValues = {
    siteName: "superbahis.com",
    dataAmpUrl: "https://3m.superbahis.com/amp.html",
    dataAmpCurrent: "https://www.superbahis.com/",
    dataAmpTitle: "3m.superbahis.com",
    href: "https://www.superbahis.com/",
    interval: "15",
  };

  const FormSchema = Yup.object().shape({
    siteName: Yup.string().required("Site name is required"),
    dataAmpUrl: Yup.string()
      .url("Must be a valid URL")
      .required("Data AMP URL is required"),
    dataAmpCurrent: Yup.string()
      .url("Must be a valid URL")
      .required("Data AMP Current URL is required"),
    dataAmpTitle: Yup.string().required("Data AMP Title is required"),
    href: Yup.string().url("Must be a valid URL").required("Href is required"),
    interval: Yup.string()
      .required("Interval is required")
      .test(
        'is-valid-interval',
        'Interval must be at least 10 seconds',
        value => {
          const intervalInSeconds = parseInt(value, 10);
          return !isNaN(intervalInSeconds) && intervalInSeconds >= 10;
        }
      )
  });

  return (
    <div className="form-container">
      <Formik
        initialValues={initialValues}
        validationSchema={FormSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          onSubmit(values, worker ? worker._id : null);
          setSubmitting(false);
          resetForm();
        }}
        enableReinitialize
      >
        {({ isSubmitting, setValues, resetForm }) => (
          <Form>
            <div className="form-field">
              <label htmlFor="siteName" className="label">
                Site
              </label>
              <Field
                name="siteName"
                className="input"
                placeholder="Enter site name"
              />
              <ErrorMessage name="siteName" component="div" className="error" />
            </div>

            <div className="form-field">
              <label htmlFor="dataAmpUrl" className="label">
                Data AMP URL
              </label>
              <Field
                name="dataAmpUrl"
                className="input"
                placeholder="Enter Data AMP URL"
              />
              <ErrorMessage
                name="dataAmpUrl"
                component="div"
                className="error"
              />
            </div>

            <div className="form-field">
              <label htmlFor="dataAmpCurrent" className="label">
                Data AMP Current
              </label>
              <Field
                name="dataAmpCurrent"
                className="input"
                placeholder="Enter Data AMP Current URL"
              />
              <ErrorMessage
                name="dataAmpCurrent"
                component="div"
                className="error"
              />
            </div>

            <div className="form-field">
              <label htmlFor="dataAmpTitle" className="label">
                Data AMP Title
              </label>
              <Field
                name="dataAmpTitle"
                className="input"
                placeholder="Enter Data AMP Title"
              />
              <ErrorMessage
                name="dataAmpTitle"
                component="div"
                className="error"
              />
            </div>

            <div className="form-field">
              <label htmlFor="href" className="label">
                Href
              </label>
              <Field
                name="href"
                className="input"
                placeholder="Enter Href URL"
              />
              <ErrorMessage name="href" component="div" className="error" />
            </div>

            <div className="form-field">
              <label htmlFor="interval" className="label">
                Interval in Seconds
              </label>
              <Field
                name="interval"
                className="input"
                placeholder="Enter Interval in Seconds"
              />
              <ErrorMessage name="interval" component="div" className="error" />
            </div>

            <button
              type="submit"
              className="btn btn-primary mr-2 submit-button"
              disabled={isSubmitting}
            >
              {worker ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              className="btn btn-secondary mr-2 cancel-button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-info mr-2 set-button"
              onClick={() => setValues(prefilledValues)}
              // disabled={isSubmitting}
            >
              Load Data
            </button>
            <button
              type="button"
              className="btn btn-warning clear-button"
              onClick={() => resetForm()}
              // disabled={isSubmitting}
            >
              Clear Form
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FormComponent;