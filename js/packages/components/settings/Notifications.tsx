import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { HeaderInfoSettings, HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, FactionButtonSetting } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

//
// Notifications
//

// Types
type NotificationsPorps = {
	isAuthorize: boolean
}

// Styles
const useStylesNotifications = () => {
	const [{ padding, text }] = useStyles()
	return {
		headerInfosTitleText: padding.left.small,
		headerInfosText: text.size.scale(11),
		headerInfosButtonText: text.size.medium,
		buttonSettingText: [text.size.scale(10), padding.left.scale(39), padding.right.scale(100)],
	}
}
const _notificationsStyles = StyleSheet.create({
	bodyNotAuthorize: {
		opacity: 0.3,
	},
})

const HeaderNotifications: React.FC<NotificationsPorps> = ({ isAuthorize }) => {
	const [{ row, color, flex, text, margin, border, padding, background }] = useStyles()
	const _styles = useStylesNotifications()
	return (
		<View>
			{!isAuthorize && (
				<View>
					<HeaderInfoSettings>
						<TouchableOpacity style={[row.right]}>
							<Icon name='close-outline' width={20} height={20} fill={color.light.blue} />
						</TouchableOpacity>
						<View style={[row.center, flex.tiny, { justifyContent: 'center' }]}>
							<Icon name='alert-circle' width={25} height={25} fill={color.red} />
							<Text
								category='h6'
								style={[text.color.white, text.bold.medium, _styles.headerInfosTitleText]}
							>
								Authorize notifications
							</Text>
						</View>
						<View style={[row.item.justify, margin.top.medium, margin.horizontal.medium]}>
							<Text
								style={[
									text.bold.medium,
									text.align.center,
									text.color.white,
									row.item.justify,
									_styles.headerInfosText,
								]}
							>
								You need to authorize notifications for the Berty app in order to receive
								notifications for new messages and contact requests
							</Text>
						</View>
						<TouchableOpacity
							style={[
								background.blue,
								border.radius.medium,
								margin.horizontal.medium,
								margin.top.medium,
							]}
						>
							<View style={[margin.vertical.medium, row.center, { justifyContent: 'center' }]}>
								<Icon name='bell-outline' width={20} height={20} fill={color.white} />
								<Text
									style={[
										text.bold.medium,
										text.color.white,
										padding.left.small,
										_styles.headerInfosButtonText,
									]}
								>
									Authorize notifications
								</Text>
							</View>
						</TouchableOpacity>
					</HeaderInfoSettings>
				</View>
			)}
		</View>
	)
}

const BodyNotifications: React.FC<NotificationsPorps> = ({ isAuthorize }) => {
	const _styles = useStylesNotifications()
	const [{ flex, padding, margin, color }] = useStyles()
	const ctx = useMsgrContext()
	return (
		<View
			style={[
				flex.tiny,
				padding.medium,
				margin.bottom.medium,
				!isAuthorize ? _notificationsStyles.bodyNotAuthorize : null,
			]}
		>
			<ButtonSetting
				name='Activate notifications'
				icon='bell-outline'
				iconSize={30}
				iconColor={color.blue}
				toggled
				varToggle={ctx.persistentOptions.notifications.enable}
				actionToggle={async () => {
					await ctx.setPersistentOption('notifications', {
						enable: ctx.persistentOptions.notifications.enable ? false : true,
					})
				}}
			/>
			<ButtonSetting
				name='Contact Request'
				toggled={true}
				icon='user-plus'
				iconPack='custom'
				iconSize={30}
				iconColor={color.blue}
				disabled
			>
				<Text style={[_styles.buttonSettingText]}>
					Receive a notification everytime someone sends you a contact request
				</Text>
			</ButtonSetting>
			<FactionButtonSetting
				name='Messages notifications'
				icon='paper-plane-outline'
				iconSize={30}
				iconColor={color.blue}
				style={[margin.top.medium]}
				disabled
			>
				<ButtonSetting name='Display noitifications' toggled disabled alone={false} />
				<ButtonSetting name='Messages preview' toggled disabled alone={false} />
				<ButtonSetting
					name='Sound'
					actionIcon='arrow-ios-forward'
					previewValue='Note'
					alone={false}
					disabled
				/>
				<ButtonSetting
					name='Exceptions'
					actionIcon='arrow-ios-forward'
					previewValue='Add'
					alone={false}
					disabled
				/>
			</FactionButtonSetting>
			<FactionButtonSetting
				name='Groups notifications'
				icon='users'
				iconPack='custom'
				iconSize={30}
				iconColor={color.blue}
				style={[margin.top.medium]}
				disabled
			>
				<ButtonSetting name='Display noitifications' toggled disabled alone={false} />
				<ButtonSetting name='Messages preview' toggled disabled alone={false} />
				<ButtonSetting
					name='Sound'
					actionIcon='arrow-ios-forward'
					previewValue='Bambou'
					alone={false}
					disabled
				/>
				<ButtonSetting
					name='Exceptions'
					actionIcon='arrow-ios-forward'
					state={{
						value: '3 exceptions',
						color: color.blue,
						bgColor: color.light.blue,
					}}
					alone={false}
					disabled
				/>
			</FactionButtonSetting>
		</View>
	)
}

export const Notifications: React.FC<ScreenProps.Settings.Notifications> = () => {
	const [isAuthorize] = useState(true)
	const { goBack } = useNavigation()
	const [{ padding, flex, background }] = useStyles()
	const ctx = useMsgrContext()

	return (
		<Layout style={[flex.tiny, background.white]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
					<HeaderSettings
						title='Notifications'
						desc={
							ctx.persistentOptions.notifications.enable
								? 'You have activated notifications!'
								: 'You have not yet activated notifications for this app'
						}
						undo={goBack}
					>
						<HeaderNotifications isAuthorize={isAuthorize} />
					</HeaderSettings>
					<BodyNotifications isAuthorize={isAuthorize} />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
