/*
 * First-run flow: Welcome > Register / Sign in > What do you follow > 18+.
 * Shown on first launch (and again from Account > Replay welcome).
 * Account > Sign in reopens just the auth step, then returns.
 */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wordmark } from '../../components/Splash';
import { BRAND } from '../../config/brand';
import { Button, Flag, Icon, type IconName } from '../../components/ui';
import { isValidEmail, requestPasswordReset, signIn, signUp, socialSignIn } from '../../services/auth';
import { useApp } from '../../state/AppProvider';
import { useData } from '../../state/DataProvider';
import { C } from '../../theme/colors';
import { s } from '../../theme/styles';
import type { User } from '../../types';

type AuthForm = {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  pass: string;
  setPass: (v: string) => void;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  run: (fn: () => Promise<User | null>, message: string) => void;
};

function AuthStep({ form }: { form: AuthForm }) {
  const { authMode, setAuthMode, showToast, setUser, afterAuth } = useApp();
  const {
    name: authName,
    setName: setAuthName,
    email: authEmail,
    setEmail: setAuthEmail,
    pass: authPass,
    setPass: setAuthPass,
    showPass,
    setShowPass,
    run,
  } = form;
  const emailOk = isValidEmail(authEmail);
  return (
    <ScrollView
      style={s.onboardBody}
      contentContainerStyle={{ paddingBottom: 16 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.onboardTitle}>{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</Text>
      <Text style={s.lead}>
        {authMode === 'signup'
          ? 'Save your favourites and picks, and pick up where you left off on any device.'
          : 'Sign in to get your favourites and saved picks back.'}
      </Text>
      <View style={s.segment}>
        {(['signup', 'signin'] as const).map((m) => (
          <Pressable
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected: authMode === m }}
            onPress={() => setAuthMode(m)}
            style={[s.segItem, authMode === m && s.segItemOn]}
          >
            <Text style={[s.segText, authMode === m && s.segTextOn]}>{m === 'signup' ? 'Register' : 'Sign in'}</Text>
          </Pressable>
        ))}
      </View>
      {authMode === 'signup' ? (
        <>
          <Text style={s.fieldLabel}>Full name</Text>
          <View style={s.authField}>
            <Icon name="person-outline" size={20} color={C.muted} />
            <TextInput
              value={authName}
              onChangeText={setAuthName}
              placeholder="e.g. Ada Okafor"
              placeholderTextColor={C.faint}
              autoCapitalize="words"
              style={s.searchInput}
              accessibilityLabel="Full name"
            />
          </View>
        </>
      ) : null}
      <Text style={s.fieldLabel}>Email</Text>
      <View style={[s.authField, authEmail.length > 3 && !emailOk && { borderColor: C.amber }]}>
        <Icon name="mail-outline" size={20} color={C.muted} />
        <TextInput
          value={authEmail}
          onChangeText={setAuthEmail}
          placeholder="you@example.com"
          placeholderTextColor={C.faint}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={s.searchInput}
          accessibilityLabel="Email"
        />
      </View>
      <Text style={s.fieldLabel}>Password</Text>
      <View style={s.authField}>
        <Icon name="lock-outline" size={20} color={C.muted} />
        <TextInput
          value={authPass}
          onChangeText={setAuthPass}
          placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Your password'}
          placeholderTextColor={C.faint}
          secureTextEntry={!showPass}
          autoCapitalize="none"
          style={s.searchInput}
          accessibilityLabel="Password"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
          onPress={() => setShowPass(!showPass)}
          hitSlop={10}
        >
          <Icon name={showPass ? 'visibility-off' : 'visibility'} size={20} color={C.muted} />
        </Pressable>
      </View>
      {authMode === 'signin' ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            requestPasswordReset(authEmail);
            showToast(isValidEmail(authEmail) ? 'A reset link would be emailed to you' : 'Enter your email first');
          }}
          style={{ alignSelf: 'flex-end', marginTop: 8 }}
        >
          <Text style={s.link}>Forgot password?</Text>
        </Pressable>
      ) : (
        <Text style={[s.meta, { marginTop: 8 }]}>By registering you agree to the Terms and Privacy Policy.</Text>
      )}
      <View style={s.authDivider}>
        <View style={s.authLine} />
        <Text style={s.meta}>or continue with</Text>
        <View style={s.authLine} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {(['Google', 'Apple'] as const).map((p) => (
          <Pressable
            key={p}
            accessibilityRole="button"
            accessibilityLabel={`Continue with ${p}`}
            onPress={() => run(() => socialSignIn(p), `${p} sign-in is simulated in this build`)}
            style={({ pressed }) => [s.socialBtn, pressed && { opacity: 0.8 }]}
          >
            {p === 'Google' ? <Text style={s.socialG}>G</Text> : <Icon name="apple" size={20} color={C.text} />}
            <Text style={s.listTitle}>{p}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setUser(null);
          afterAuth();
        }}
        style={{ alignSelf: 'center', marginTop: 18 }}
      >
        <Text style={[s.link, { color: C.soft }]}>Skip for now, continue as guest</Text>
      </Pressable>
    </ScrollView>
  );
}

export function Onboarding() {
  const {
    onboardStep,
    setOnboardStep,
    authMode,
    authReturn,
    setAuthReturn,
    setOnboarded,
    followComps,
    setFollowComps,
    ageOk,
    setAgeOk,
    openPage,
    setUser,
    showToast,
    afterAuth,
    finishOnboarding,
  } = useApp();
  const { compOrder, comp } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = (fn: () => Promise<User | null>, message: string) => {
    setBusy(true);
    fn()
      .then((u) => {
        setUser(u);
        showToast(message);
        setPass('');
        afterAuth();
      })
      .catch((e: unknown) => showToast(e instanceof Error ? e.message : 'Something went wrong. Try again.'))
      .finally(() => setBusy(false));
  };
  const form: AuthForm = { name, setName, email, setEmail, pass, setPass, showPass, setShowPass, run };
  const authValid = isValidEmail(email) && pass.length >= 6 && (authMode === 'signin' || name.trim().length >= 2);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.onboard}>
          <View style={s.onboardDots}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[s.onboardDot, onboardStep === i && s.onboardDotOn]} />
            ))}
          </View>
          {onboardStep === 0 ? (
            <ScrollView style={s.onboardBody} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
              <Wordmark style={s.brandLarge} />
              <Text style={s.onboardTitle}>Don't guess.{'\n'}Understand the game.</Text>
              {(
                [
                  ['percent', 'Clear probabilities', 'Every pick shows how likely our model thinks it is, never a promise.'],
                  ['query-stats', 'The evidence behind it', 'Form, stats and head to head in one place.'],
                  ['fact-check', 'An honest record', 'Every settled pick stays public, including the misses.'],
                ] as [IconName, string, string][]
              ).map(([icon, t, b]) => (
                <View key={t} style={s.infoRow}>
                  <View style={s.settingIcon}>
                    <Icon name={icon} size={20} color={C.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.listTitle}>{t}</Text>
                    <Text style={s.body}>{b}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : onboardStep === 1 ? (
            <AuthStep form={form} />
          ) : onboardStep === 2 ? (
            <ScrollView style={s.onboardBody} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={s.onboardTitle}>What do you follow?</Text>
              <Text style={s.lead}>We'll put these first. You can change this any time in Favourites.</Text>
              {compOrder.map((c) => {
                const on = followComps.includes(c);
                return (
                  <Pressable
                    key={c}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    onPress={() => setFollowComps((cs) => (on ? cs.filter((x) => x !== c) : [...cs, c]))}
                    style={[s.planCard, on && s.planCardOn]}
                  >
                    <Flag country={comp(c).country} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.listTitle}>{comp(c).name}</Text>
                      <Text style={s.listSub}>{comp(c).country}</Text>
                    </View>
                    <Icon name={on ? 'check-circle' : 'radio-button-unchecked'} size={22} color={on ? C.accent : C.faint} />
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <ScrollView style={s.onboardBody} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={s.onboardTitle}>One last thing</Text>
              <Text style={s.lead}>
                {BRAND.name} is for adults. Our estimates help you understand matches, but football is unpredictable and no pick is
                guaranteed.
              </Text>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ageOk }}
                onPress={() => setAgeOk(!ageOk)}
                style={[s.planCard, ageOk && s.planCardOn]}
              >
                <Icon name={ageOk ? 'check-box' : 'check-box-outline-blank'} size={24} color={ageOk ? C.accent : C.muted} />
                <Text style={[s.listTitle, { flex: 1, marginLeft: 12 }]}>I'm 18 or older and understand estimates are not certainties</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setOnboarded(true);
                  openPage('responsible');
                }}
              >
                <Text style={[s.link, { marginTop: 8 }]}>Read about playing responsibly</Text>
              </Pressable>
            </ScrollView>
          )}
          <View style={s.onboardFoot}>
            {onboardStep > 0 ? (
              <Button
                kind="ghost"
                label="Back"
                onPress={() => {
                  if (authReturn) {
                    setAuthReturn(false);
                    setOnboarded(true);
                  } else setOnboardStep(onboardStep - 1);
                }}
              />
            ) : (
              <View />
            )}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Button
                label={
                  onboardStep === 0
                    ? 'Get started'
                    : onboardStep === 1
                      ? authMode === 'signup'
                        ? 'Create account'
                        : 'Sign in'
                      : onboardStep === 2
                        ? `Continue${followComps.length ? ` · ${followComps.length} selected` : ''}`
                        : 'Show me today’s matches'
                }
                disabled={busy || (onboardStep === 1 && !authValid) || (onboardStep === 3 && !ageOk)}
                onPress={() => {
                  if (onboardStep === 1) {
                    run(
                      () => (authMode === 'signup' ? signUp(form.name, form.email, form.pass) : signIn(form.email, form.pass)),
                      authMode === 'signup' ? 'Account created' : 'Signed in',
                    );
                  } else if (onboardStep < 3) setOnboardStep(onboardStep + 1);
                  else finishOnboarding();
                }}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
