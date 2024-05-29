import React, { useState } from "react";
import "./FormComponent.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { postToServer } from "../helpers/request";

const FormComponent = ({ worker, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const initialValues = {
    siteName: worker ? worker.siteName : "",
    dataAmpUrl: worker ? worker.dataAmpUrl : "",
    dataAmpCurrent: worker ? worker.dataAmpCurrent : "",
    dataAmpTitle: worker ? worker.dataAmpTitle : "",
    href: worker ? worker.href : "",
    interval: worker ? worker.interval : "",
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

  const loadData = async (siteName, setValues) => {
    setLoading(true);
    try {
      const response = await postToServer("/load-data", { siteName });
      if (response.status) {
        setValues({
          siteName,
          dataAmpUrl: response.data['data-amp'],
          dataAmpCurrent: response.data['data-amp-cur'],
          dataAmpTitle: response.data['data-amp-title'],
          href: response.data.href,
        });
        toast.success("Data loaded successfully!");
      } else {
        toast.error("Failed to load data: " + response.message);
      }
    } catch (error) {
      toast.error("Error loading data: " + error.message);
    }
    setLoading(false);
  };

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
        {({ isSubmitting, setValues, resetForm, values }) => (
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
              onClick={() => loadData(values.siteName, setValues)}
              disabled={loading || isSubmitting}
            >
              {loading ? 'Loading...' : 'Load Data'}
            </button>
            <button
              type="button"
              className="btn btn-warning clear-button"
              onClick={() => resetForm()}
              disabled={isSubmitting}
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
