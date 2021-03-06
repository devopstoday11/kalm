import { Box, createStyles, WithStyles, withStyles } from "@material-ui/core";
import { Theme } from "@material-ui/core/styles";
import { createApplicationAction } from "actions/application";
import { push } from "connected-react-router";
import { FinalTextField } from "forms/Final/textfield";
import { FormDataPreview } from "forms/Final/util";
import { APPLICATION_FORM_ID } from "forms/formIDs";
import { trimAndToLowerParse } from "forms/normalizer";
import React from "react";
import { Field, Form, FormRenderProps } from "react-final-form";
import { connect } from "react-redux";
import { RootState } from "reducers";
import { theme } from "theme/theme";
import { FormTutorialHelper } from "tutorials/formValueToReudxStoreListener";
import { finalValidateOrNotBlockByTutorial } from "tutorials/utils";
import { TDispatchProp } from "types";
import { Application } from "types/application";
import { SubmitButton } from "widgets/Button";
import { KPanel } from "widgets/KPanel";
import { Body } from "widgets/Label";
import { ValidatorIsDNS123Label } from "../validator";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: 20,
    },
    displayNone: {
      display: "none",
    },
    displayFlex: {
      display: "flex",
    },
    buttons: {
      margin: "20px 0 0",
    },
    submitButton: {
      marginRight: theme.spacing(4),
    },
  });

const mapStateToProps = (state: RootState) => {
  return {
    tutorialState: state.tutorial,
    isSubmittingApplication: state.applications.isSubmittingApplication,
    form: APPLICATION_FORM_ID,
  };
};

interface OwnProps {}

interface ConnectedProps extends ReturnType<typeof mapStateToProps>, TDispatchProp {}

export interface Props extends ConnectedProps, WithStyles<typeof styles>, OwnProps {}

class ApplicationFormRaw extends React.PureComponent<Props> {
  private renderBasic(name: string) {
    return (
      <>
        <Field
          name="name"
          label="App Name"
          id="application-name"
          component={FinalTextField}
          autoFocus
          validate={ValidatorIsDNS123Label}
          parse={trimAndToLowerParse}
          placeholder="e.g. my-application; production"
          helperText="Must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character"
        />

        <Box mt={2} style={{ color: theme.palette.text.secondary }}>
          <Body>The App Name becomes part of the DNS name for its resources:</Body>
          <Box p={1}>
            <code id="application-name-code">
              {"<COMPONENT_NAME>"}.<strong style={{ color: theme.palette.text.primary }}>{name || "<APP_NAME>"}</strong>
              .svc.cluster.local
            </code>
          </Box>
        </Box>
      </>
    );
  }

  private onSubmit = async (applicationFormValue: Application) => {
    const { dispatch } = this.props;
    await dispatch(createApplicationAction(applicationFormValue));
    dispatch(push(`/applications/${applicationFormValue.name}/components/new`));
  };

  public render() {
    const { classes, form, tutorialState } = this.props;

    return (
      <Form
        initialValues={{ name: "" }}
        onSubmit={this.onSubmit}
        keepDirtyOnReinitialize
        validate={(values) => finalValidateOrNotBlockByTutorial(values, tutorialState, form)}
        render={({ handleSubmit, values }: FormRenderProps<Application>) => (
          <form onSubmit={handleSubmit} className={classes.root} tutorial-anchor-id="application-form">
            <FormTutorialHelper form={form} />
            <KPanel
              content={
                <Box p={2} tutorial-anchor-id="application-form-name-field">
                  {this.renderBasic(values.name)}
                </Box>
              }
            />

            {/* {errors.name && touched.name ? (
          <Box pt={2}>
            <Alert severity="error">{errors.name}</Alert>
          </Box>
        ) : null} */}

            <FormDataPreview />

            <Box pt={3} className={classes.displayFlex}>
              <SubmitButton
                tutorial-anchor-id="application-form-submit-button"
                className={`${classes.submitButton}`}
                id="add-application-submit-button"
              >
                Create App
              </SubmitButton>
            </Box>
          </form>
        )}
      />
    );
  }
}

export default connect(mapStateToProps)(withStyles(styles)(ApplicationFormRaw));
