import React from "react";
import "./FormComponent.css";
import { useDispatch } from "react-redux";
import { setFormData, setResponseData } from "../store/formSlice";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

// Define your form validation schema
const FormSchema = Yup.object().shape({
  site: Yup.string().required("Site is required"),
  "data-amp": Yup.string()
    .url("Must be a valid URL")
    .required("Data AMP is required"),
  "data-amp-cur": Yup.string()
    .url("Must be a valid URL")
    .required("Data AMP Current is required"),
  "data-amp-title": Yup.string().required("Data AMP Title is required"),
  href: Yup.string().url("Must be a valid URL").required("Href is required"),
});

const FormComponent = () => {
  const dispatch = useDispatch();

  return (
    <div className="form-container">
      <Formik
        initialValues={{
          site: "",
          "data-amp": "",
          "data-amp-cur": "",
          "data-amp-title": "",
          href: "",
        }}
        validationSchema={FormSchema}
        onSubmit={(values, { setSubmitting }) => {
          // Dispatch the action to save form data to the Redux store
          dispatch(setFormData(values));
          console.log("Submitting the following values:", values);
          toast.success("Form has been submitted! Please wait 20-30s");
          // Here's where you'll make the POST request
          fetch("http://localhost:3000/process-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => {
              // Handle success
              console.log("Success response:", data);
              dispatch(setResponseData(data));
              toast.success("Data has been scrapped successfully!");
            })
            .catch((error) => {
              console.error("Fetch error:", error);
              toast.error("An error occurred!");
            })
            .finally(() => {
              setSubmitting(false); // Finish submitting state
            });
        }}
      >
        {() => (
          <Form>
            <div className="form-field">
              <label htmlFor="site" className="label">
                Site
              </label>
              <Field
                name="site"
                className="input"
                placeholder="Enter site name"
              />
              <ErrorMessage name="site" component="div" className="error" />
            </div>

            <div className="form-field">
              <label htmlFor="data-amp" className="label">
                Data AMP URL
              </label>
              <Field
                name="data-amp"
                className="input"
                placeholder="Enter Data AMP URL"
              />
              <ErrorMessage name="data-amp" component="div" className="error" />
            </div>

            <div className="form-field">
              <label htmlFor="data-amp-cur" className="label">
                Data AMP Current
              </label>
              <Field
                name="data-amp-cur"
                className="input"
                placeholder="Enter Data AMP Current URL"
              />
              <ErrorMessage
                name="data-amp-cur"
                component="div"
                className="error"
              />
            </div>

            <div className="form-field">
              <label htmlFor="data-amp-title" className="label">
                Data AMP Title
              </label>
              <Field
                name="data-amp-title"
                className="input"
                placeholder="Enter Data AMP Title"
              />
              <ErrorMessage
                name="data-amp-title"
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

            <button type="submit" className="submit-button">
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FormComponent;
