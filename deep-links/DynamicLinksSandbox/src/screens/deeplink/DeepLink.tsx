import {useDeepLinkContext} from 'context';
import Clipboard from 'expo-clipboard';
import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Button, Input} from 'react-native-elements';
import {Colors} from 'react-native/Libraries/NewAppScreen';

export const DeepLink: React.FC = () => {
  const {link, createLink} = useDeepLinkContext();
  const [teamName, setTeamName] = useState<string>();
  const [createdLink, setCreatedLink] = useState<string>();
  const [copiedMessage, setCopiedMessage] = useState<string>();

  const onChangeTeamName = useCallback(
    (text: string) => {
      setTeamName(text);
    },
    [setTeamName],
  );

  const createTeamLink = useCallback(() => {
    if (teamName) {
      createLink('team', teamName)
        .then((link) => {
          setCreatedLink(link);
        })
        .catch((e) => console.log(e));
    }
  }, [createLink, setCreatedLink, teamName]);

  const copyToClipBoard = useCallback(() => {
    if (createdLink) {
      Clipboard.setString(createdLink);
      setCopiedMessage('リンクをコピーしました');
      setTimeout(() => setCopiedMessage(undefined), 1500);
    }
  }, [createdLink]);

  return (
    <View style={styles.body}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Deep Link</Text>
        <Text style={styles.sectionDescription}>{link ? link.url : 'リンクはありません。'}</Text>
      </View>
      <View style={styles.sectionContainer}>
        <Text>チーム名を入力してください</Text>
        <Input onChangeText={onChangeTeamName} />
        <Button disabled={!teamName} onPress={createTeamLink} title="リンクを作成" />
      </View>
      {createdLink && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>生成されたURLです。タッチするとコピーされます。</Text>
          <TouchableOpacity onPress={copyToClipBoard}>
            <Text>{createdLink}</Text>
          </TouchableOpacity>
          <Text style={styles.sectionDescription}>{copiedMessage}</Text>
        </View>
      )}
    </View>
  );
};

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */