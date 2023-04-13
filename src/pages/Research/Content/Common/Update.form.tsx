import arrayMutators from 'final-form-arrays'
import { observer } from 'mobx-react'
import * as React from 'react'
import { Field, Form } from 'react-final-form'
import type { RouteComponentProps } from 'react-router'
import { Prompt } from 'react-router'
import { Box, Card, Flex, Heading, Text } from 'theme-ui'
import IconHeaderHowto from 'src/assets/images/header-section/howto-header-icon.svg'
import {
  Button,
  FieldInput,
  FieldTextarea,
  ElWithBeforeIcon,
  InternalLink,
} from 'oa-components'
import { ImageInputField } from 'src/common/Form/ImageInput.field'
import type { IResearch } from 'src/models/research.models'
import { useResearchStore } from 'src/stores/Research/research.store'
// TODO: Remove direct usage of Theme
import { preciousPlasticTheme } from 'oa-themes'
const theme = preciousPlasticTheme.styles
import { COMPARISONS } from 'src/utils/comparisons'
import { required } from 'src/utils/validators'
import styled from '@emotion/styled'
import { UpdateSubmitStatus } from './SubmitStatus'

const ImageInputFieldWrapper = styled.div`
  width: 150px;
  height: 100px;
  margin-right: 10px;
  margin-bottom: 6px;
`

const CONFIRM_DIALOG_MSG =
  'You have unsaved changes. Are you sure you want to leave this page?'

interface IProps extends RouteComponentProps<any> {
  formValues: any
  parentType: 'create' | 'edit'
}

const FormContainer = styled.form`
  width: 100%;
`

const Label = styled.label`
  font-size: ${theme.fontSizes[2] + 'px'};
  margin-bottom: ${theme.space[2] + 'px'};
  display: block;
`

const beforeUnload = (e) => {
  e.preventDefault()
  e.returnValue = CONFIRM_DIALOG_MSG
}

const UpdateForm = observer((props: IProps) => {
  const store = useResearchStore()
  const [showSubmitModal, setShowSubmitModal] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (store.updateUploadStatus?.Complete) {
      window.removeEventListener('beforeunload', beforeUnload, false)
    }
  }, [store.updateUploadStatus?.Complete])

  const trySubmitForm = () => {
    const form = document.getElementById('updateForm')
    if (typeof form !== 'undefined' && form !== null) {
      form.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true }),
      )
    }
  }

  const onSubmit = (formValues: IResearch.Update) => {
    setShowSubmitModal(true)
    store.uploadUpdate({
      ...formValues,
      collaborators: Array.from(
        new Set(
          [
            ...(formValues?.collaborators || []),
            store.activeUser?.userName || '',
          ].filter(Boolean),
        ),
      ),
    })
  }

  // Display a confirmation dialog when leaving the page outside the React Router
  const unloadDecorator = (form) => {
    return form.subscribe(
      ({ dirty }) => {
        if (dirty && !store.updateUploadStatus.Complete) {
          window.addEventListener('beforeunload', beforeUnload, false)
          return
        }
        window.removeEventListener('beforeunload', beforeUnload, false)
      },
      { dirty: true },
    )
  }

  /**
   * Ensure either url or images included (not both), and any url formatted correctly
   */
  const validateMedia = (videoUrl: string, values: any) => {
    const images = values.images
    if (videoUrl) {
      if (images && images[0]) {
        return 'Do not include both images and video'
      }
      const ytRegex = new RegExp(/(youtu\.be\/|youtube\.com\/watch\?v=)/gi)
      const urlValid = ytRegex.test(videoUrl)
      return urlValid ? null : 'Please provide a valid YouTube Url'
    }
    return images && images[0] ? null : 'Include either images or a video'
  }

  return (
    <>
      {showSubmitModal && (
        <UpdateSubmitStatus
          {...props}
          onClose={() => {
            setShowSubmitModal(false)
            store.resetUpdateUploadStatus()
          }}
        />
      )}
      <Form
        onSubmit={(v) => {
          onSubmit(v as IResearch.Update)
        }}
        initialValues={props.formValues}
        mutators={{
          ...arrayMutators,
        }}
        validateOnBlur
        decorators={[unloadDecorator]}
        render={({ submitting, dirty, handleSubmit, values }) => {
          return (
            <Flex
              mx={-2}
              mb={4}
              bg={'inherit'}
              sx={{ flexWrap: 'wrap' }}
              data-testid="EditResearchUpdate"
            >
              <Flex
                bg="inherit"
                px={2}
                sx={{ width: ['100%', '100%', `${(2 / 3) * 100}%`] }}
                mt={4}
              >
                <Prompt
                  when={!store.updateUploadStatus.Complete && dirty}
                  message={CONFIRM_DIALOG_MSG}
                />
                <FormContainer id="updateForm" onSubmit={handleSubmit}>
                  {/* Update Info */}
                  <Flex sx={{ flexDirection: 'column' }}>
                    <Card bg={theme.colors.softblue}>
                      <Flex px={3} py={2} sx={{ alignItems: 'center' }}>
                        <Heading>
                          {props.parentType === 'create' ? (
                            <span>New update</span>
                          ) : (
                            <span>Edit your update</span>
                          )}{' '}
                        </Heading>
                        <Box ml="15px">
                          <ElWithBeforeIcon icon={IconHeaderHowto} size={20} />
                        </Box>
                      </Flex>
                    </Card>
                    <Card mt={3}>
                      <Flex
                        p={4}
                        sx={{ flexWrap: 'wrap', flexDirection: 'column' }}
                      >
                        <Flex
                          mx={-2}
                          sx={{ flexDirection: ['column', 'column', 'row'] }}
                        >
                          <Flex
                            px={2}
                            sx={{ flexDirection: 'column', flex: [1, 1, 4] }}
                          >
                            <Flex sx={{ flexDirection: 'column' }} mb={3}>
                              <Label htmlFor="title">
                                Title of this update
                              </Label>
                              <Field
                                id="title"
                                name="title"
                                data-cy="intro-title"
                                validateFields={[]}
                                validate={required}
                                isEqual={COMPARISONS.textInput}
                                component={FieldInput}
                                maxLength="40"
                                placeholder="Title of this update (max 40 characters)"
                              />
                            </Flex>
                            <Flex sx={{ flexDirection: 'column' }} mb={3}>
                              <Label htmlFor="description">
                                Description of this update
                              </Label>
                              <Field
                                id="description"
                                name="description"
                                data-cy="intro-description"
                                validate={required}
                                validateFields={[]}
                                isEqual={COMPARISONS.textInput}
                                component={FieldTextarea}
                                style={{
                                  resize: 'none',
                                  flex: 1,
                                  minHeight: '150px',
                                }}
                                maxLength="1500"
                                placeholder="Explain what is happening in your research (max 1500 characters)"
                              />
                            </Flex>
                            <Label htmlFor={`images`}>
                              Upload image(s) for this update
                            </Label>
                            <Flex
                              sx={{
                                flexDirection: ['column', 'row'],
                                flexWrap: 'wrap',
                                alignItems: 'center',
                              }}
                              mb={3}
                            >
                              <ImageInputFieldWrapper data-cy="image-0">
                                <Field
                                  hasText={false}
                                  name={`images[0]`}
                                  component={ImageInputField}
                                  isEqual={COMPARISONS.image}
                                  validateFields={['videoUrl']}
                                />
                              </ImageInputFieldWrapper>
                              <ImageInputFieldWrapper data-cy="image-1">
                                <Field
                                  hasText={false}
                                  name={`images[1]`}
                                  validateFields={['videoUrl']}
                                  component={ImageInputField}
                                  isEqual={COMPARISONS.image}
                                />
                              </ImageInputFieldWrapper>
                              <ImageInputFieldWrapper data-cy="image-2">
                                <Field
                                  hasText={false}
                                  name={`images[2]`}
                                  validateFields={['videoUrl']}
                                  component={ImageInputField}
                                  isEqual={COMPARISONS.image}
                                />
                              </ImageInputFieldWrapper>
                              <ImageInputFieldWrapper data-cy="image-3">
                                <Field
                                  hasText={false}
                                  name={`images[3]`}
                                  validateFields={['videoUrl']}
                                  component={ImageInputField}
                                  isEqual={COMPARISONS.image}
                                />
                              </ImageInputFieldWrapper>
                              <ImageInputFieldWrapper data-cy="image-4">
                                <Field
                                  hasText={false}
                                  name={`images[4]`}
                                  validateFields={['videoUrl']}
                                  component={ImageInputField}
                                  isEqual={COMPARISONS.image}
                                />
                              </ImageInputFieldWrapper>
                            </Flex>
                            <Flex sx={{ flexDirection: 'column' }} mb={3}>
                              <Label htmlFor={`videoUrl`}>
                                Or embed a YouTube video
                              </Label>
                              <Field
                                name={`videoUrl`}
                                data-cy="videoUrl"
                                component={FieldInput}
                                placeholder="https://youtube.com/watch?v="
                                validate={(url, values) =>
                                  validateMedia(url, values)
                                }
                                validateFields={[]}
                                isEqual={COMPARISONS.textInput}
                              />
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                  </Flex>
                </FormContainer>
              </Flex>
              <Flex
                sx={{
                  flexDirection: 'column',
                  width: ['100%', '100%', `${100 / 3}%`],
                  height: '100%',
                }}
                bg="inherit"
                px={2}
                mt={[0, 0, 4]}
              >
                <Box
                  sx={{
                    position: ['relative', 'relative', 'sticky'],
                    top: 3,
                    maxWidth: ['inherit', 'inherit', '400px'],
                  }}
                >
                  <Button
                    large
                    data-cy={'submit'}
                    onClick={trySubmitForm}
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                    sx={{
                      mb: ['40px', '40px', 0],
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <span>
                      {props.parentType === 'edit' ? 'Save' : 'Add update'}
                    </span>
                  </Button>

                  {store.activeResearchItem ? (
                    <Card sx={{ mt: 4, p: 4 }}>
                      <Heading as="h3" mb={3} variant="small">
                        Research overview
                      </Heading>
                      <Box as={'ul'} sx={{ margin: 0, mb: 4, p: 0, pl: 3 }}>
                        {store.activeResearchItem.updates.map(
                          (update, index) => (
                            <Box as={'li'} key={index} sx={{ mb: 1 }}>
                              <Text variant={'quiet'}>
                                {update._id === props.formValues._id ? (
                                  <strong>{update.title}</strong>
                                ) : (
                                  <>
                                    {update.title}
                                    <InternalLink
                                      to={`/research/${store.activeResearchItem?.slug}/edit-update/${update._id}`}
                                      sx={{ display: 'inline-block', ml: 1 }}
                                    >
                                      Edit
                                    </InternalLink>
                                  </>
                                )}
                              </Text>
                            </Box>
                          ),
                        )}
                        {props.parentType !== 'edit' ? (
                          <Box as={'li'} sx={{ mb: 1 }}>
                            <Text variant={'quiet'}>
                              {values.title || '---'}
                            </Text>
                          </Box>
                        ) : null}
                      </Box>
                      {props.parentType === 'edit' ? (
                        <Button small sx={{ mr: 2 }}>
                          <InternalLink
                            to={`/research/${store.activeResearchItem?.slug}/new-update`}
                            sx={{ color: 'black' }}
                          >
                            Create update
                          </InternalLink>
                        </Button>
                      ) : null}

                      <Button small variant={'outline'}>
                        <InternalLink
                          to={`/research/${store.activeResearchItem?.slug}/edit`}
                          sx={{ color: 'black' }}
                        >
                          Back to research
                        </InternalLink>
                      </Button>
                    </Card>
                  ) : null}
                </Box>
              </Flex>
            </Flex>
          )
        }}
      />
    </>
  )
})

export default UpdateForm
