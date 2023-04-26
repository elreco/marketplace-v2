import { FC, ReactNode, useEffect, useState } from 'react'
import { Content, Overlay } from 'components/primitives/Dialog'
import {
  Root as DialogRoot,
  DialogTrigger,
  DialogPortal,
} from '@radix-ui/react-dialog'
import { Box, Flex, Text } from 'components/primitives'
import * as RadixDialog from '@radix-ui/react-dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

type Props = {
  trigger: ReactNode
  children: ReactNode
  isOpen: boolean
  title: string
}

export const RegularModal: FC<Props> = ({
  trigger,
  children,
  title,
  isOpen,
}) => {
  const [open, setOpen] = useState(isOpen || false)
  useEffect(() => setOpen(isOpen), [isOpen])

  return (
    <DialogRoot open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogPortal>
        <Overlay
          css={{
            position: 'fixed',
            inset: 0,
            animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);',
            backgroundColor: '$blackA10',
          }}
        >
          <Content
            css={{
              borderRadius: '6px',
              boxShadow:
                'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
              position: 'fixed',
              top: '9%',
              transformX: 'translate(-50%)',
              width: '100%',
              maxWidth: '750px',
              maxHeight: '85vh',
              animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
              minWidth: '50%',
            }}
          >
            <Flex
              align="center"
              justify="between"
              css={{
                padding: '16px',
                backgroundColor: '$slate2',
              }}
            >
              <Text style="h6">{title}</Text>
              <RadixDialog.Close>
                <Flex
                  css={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '$gray11',
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} width={16} height={16} />
                </Flex>
              </RadixDialog.Close>
            </Flex>
            <Box
              css={{
                padding: '16px',
              }}
            >
              {children}
            </Box>
          </Content>
        </Overlay>
      </DialogPortal>
    </DialogRoot>
  )
}
