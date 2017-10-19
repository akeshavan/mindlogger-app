
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {reduxForm, Field, formValueSelector, FieldArray, submit, reset} from 'redux-form';
import { Container, Header, Title, Content, Button, Item, Label, Input, Body, Left, Right, Icon, Form, Text, Segment, Radio, View, Row, Subtitle } from 'native-base';
import { Actions } from 'react-native-router-flux';
import {updateSurvey} from '../../actions'
import {FormInputItem, FormSwitchItem, FormRadioButtonGroup} from '../../../../components/form/FormItem'

const questionInitialState = {
  type: "text",
  rows: []
}
class SurveyEditQuestionForm extends Component {

    constructor(props) {
      super(props)
    }

    renderRows = ({fields, meta: {error, submitFailed}}) => {
      return (<View padder>
          {fields.map((member,index) => (
            <Field key={index} inlineLabel label={`Choice ${index+1}`} name={`${member}.text`} type="text" component={FormInputItem}/>
          ))}
          <Row padder><Right><Button onPress={()=> fields.push({text:'', value:fields.length})}><Text>Add choice</Text></Button></Right></Row>
        </View>)
    }

    render() {
      console.log("form:", this.props)
      const { handleSubmit, onSubmit, submitting, reset } = this.props;
      let question_type = this.props.question_type || (this.props.initialValues && this.props.initialValues.type)
      return (
          <Form>
          <Field name="title" floatingLabel type="text" placeholder="Add a question" component={FormInputItem} />
          <Field name="type"
            component ={FormRadioButtonGroup}
            placeholder = "Question Type"
            options   ={[
              {text:"Text answer",value:"text"},
              {text:"Multiple choice",value:"single_sel"},
              {text:"Multiple selection",value:"multi_sel"},
            ]} />
          { (question_type && question_type !== 'text') ? (<FieldArray name="rows" component={this.renderRows}/>) : false}
          </Form>)
    }
}

SurveyEditQuestionReduxForm = reduxForm({
  form: 'survey-edit-question',
  enableReinitialize: true,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true
})(SurveyEditQuestionForm)

const selector = formValueSelector('survey-edit-question')
SurveyEditQuestionValueForm = connect(
  state => {
    const question_type = selector(state, 'type')
    return {question_type}
  }
)(SurveyEditQuestionReduxForm)

class SurveyBasicEditQuestionScreen extends Component {

  static propTypes = {
    popRoute: React.PropTypes.func,
    navigation: React.PropTypes.shape({
      key: React.PropTypes.string,
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      mode: 1,
    };
  }

  pushRoute(route) {
    Actions.push(route)
  }

  popRoute() {
    Actions.pop()
  }

  updateQuestion = (body) => {
    let {surveyIdx, questionIdx, surveys} = this.props
    if(surveyIdx < 0) {
      surveyIdx = surveys.length + surveyIdx
    }
    console.log(surveyIdx)
    let survey = surveys[surveyIdx]
    let questions = survey.questions || []
    if(questions.length>questionIdx) {
      questions[questionIdx] = body
    } else {
      questions.push(body)
    }
    survey.questions = questions
    return this.props.updateSurvey(surveyIdx, survey)
  }

  updateAndNext() {
    this.props.submitForm()
    let {surveyIdx, questionIdx, surveys} = this.props
    if(surveyIdx < 0) {
      surveyIdx = surveys.length + surveyIdx
    }
    questionIdx = questionIdx + 1
    Actions.replace("survey_basic_edit_question",{surveyIdx, questionIdx})
  }
  updateAndDone() {
    this.props.submitForm()
    this.popRoute()
  }
  deleteQuestion() {
    let {surveyIdx, questionIdx, surveys} = this.props
    if(surveyIdx < 0) {
      surveyIdx = surveys.length + surveyIdx
    }
    let survey = surveys[surveyIdx]
    let questions = survey.questions || []
    if(questions.length>questionIdx) {
      questions.splice(questionIdx,1)
      this.props.updateSurvey(surveyIdx, survey)
    } else {
    }
    survey.questions = questions
    questionIdx = questionIdx - 1
    Actions.replace("survey_basic_edit_question",{surveyIdx, questionIdx})
  }

  render() {
    let {surveyIdx, questionIdx, surveys} = this.props
    if(surveyIdx < 0) {
      surveyIdx = surveys.length + surveyIdx
    }
    const survey = surveys[surveyIdx]
    let question = questionInitialState
    if(questionIdx<survey.questions.length) {
      question = survey.questions[questionIdx]
    } else {
      question = questionIdx>0 && {...survey.questions[questionIdx-1], title: ''}
    }
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body style={{flex:2}}>
            <Title>{survey.title}</Title>
            <Subtitle>{survey.accordion ? "Accordion survey" : "Sequential survey"}</Subtitle>
          </Body>
          <Right>
            <Button transparent onPress={() => Actions.pop()}>
              <Icon name="trash" />
            </Button>
          </Right>
        </Header>
        <Content padder>
          <Text>Question {questionIdx+1}</Text>
          <SurveyEditQuestionValueForm onSubmit={this.updateQuestion} initialValues={question}/>
          <Row style={{ marginTop: 20 }}>
            <Button block onPress={() => this.updateAndNext()} style={{ margin: 15, flex:1}}>
              <Text>Next</Text>
            </Button>
            <Button block danger onPress={() => this.deleteQuestion()} style={{ margin: 15, flex:1}}>
              <Text>Delete</Text>
            </Button>
          </Row>
          <Button block style={{ margin: 15 }} onPress={()=> this.updateAndDone()}><Text>Done</Text></Button>
          
          
        </Content>
      </Container>
    );
  }
} 

const mapDispatchToProps = (dispatch) => ({
  updateSurvey: (index, data) => dispatch(updateSurvey(index, data)),
  submitForm: () => {
    dispatch(submit('survey-edit-question'))
  },
  resetForm: () => {
    dispatch(reset('survey-edit-question'))
  },
})

const mapStateToProps = state => ({
  surveys: state.survey.surveys,
  navigation: state.cardNavigation,
  themeState: state.drawer.themeState,
});

export default connect(mapStateToProps, mapDispatchToProps)(SurveyBasicEditQuestionScreen);
