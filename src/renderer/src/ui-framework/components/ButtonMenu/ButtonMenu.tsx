import type {ReactNode} from 'react'
import {Button, type IButtonProps} from '../Button'
import {Icon, type IconName} from '../Icon'

const iconSize = 20

export interface IButtonMenuProps<V> extends Omit<IButtonProps<V>, 'label'> {
  icon: IconName
  label: ReactNode
}

export function ButtonMenu<V>({icon, label, ...otherProps}: IButtonMenuProps<V>) {
  return (
    <Button variant="menu" {...otherProps}>
      <Icon name={icon} size={iconSize} />
      <span className="margin-left-1">{label}</span>
    </Button>
  )
}
